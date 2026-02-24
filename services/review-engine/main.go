package main

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"sort"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
)

const (
	serviceName = "review-engine"
	moduleName  = "ERP-Autonomous-Coding"
	basePath    = "/v1/code-reviews"
	dbName      = "erp_coding"
	tableName   = "coding_reviews"
	eventTopic  = "erp.coding.review"
	cacheTTL    = 45 * time.Second
)

var validStatuses = map[string]bool{"pending": true, "in_progress": true, "completed": true, "failed": true}

type codeReview struct {
	ID                string  `json:"id"`
	TenantID          string  `json:"tenant_id"`
	SessionID         *string `json:"session_id,omitempty"`
	PRURL             *string `json:"pr_url,omitempty"`
	RepositoryID      *string `json:"repository_id,omitempty"`
	FilesJSON         *string `json:"files_json,omitempty"`
	FindingsJSON      *string `json:"findings_json,omitempty"`
	SeverityCountsJSON *string `json:"severity_counts_json,omitempty"`
	OverallScore      int     `json:"overall_score"`
	SecurityScore     int     `json:"security_score"`
	QualityScore      int     `json:"quality_score"`
	PerformanceScore  int     `json:"performance_score"`
	ModelUsed         *string `json:"model_used,omitempty"`
	Status            string  `json:"status"`
	ReviewedAt        *string `json:"reviewed_at,omitempty"`
	CreatedAt         string  `json:"created_at"`
	UpdatedAt         string  `json:"updated_at"`
}

func newID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v)
}

func readJSON(r *http.Request) (map[string]any, error) {
	body, err := io.ReadAll(io.LimitReader(r.Body, 1<<20))
	if err != nil {
		return nil, err
	}
	defer r.Body.Close()
	if len(body) == 0 {
		return nil, errors.New("empty body")
	}
	var m map[string]any
	if err := json.Unmarshal(body, &m); err != nil {
		return nil, err
	}
	return m, nil
}

func strPtr(v any) *string {
	if v == nil {
		return nil
	}
	s := fmt.Sprintf("%v", v)
	return &s
}

func strVal(p *string) string {
	if p == nil {
		return ""
	}
	return *p
}

type cacheEntry struct {
	data      any
	expiresAt time.Time
}

type ttlCache struct {
	mu      sync.RWMutex
	entries map[string]cacheEntry
}

func newCache() *ttlCache {
	c := &ttlCache{entries: make(map[string]cacheEntry)}
	go func() {
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()
		for range ticker.C {
			c.evict()
		}
	}()
	return c
}

func (c *ttlCache) get(key string) (any, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	e, ok := c.entries[key]
	if !ok || time.Now().After(e.expiresAt) {
		return nil, false
	}
	return e.data, true
}

func (c *ttlCache) set(key string, data any) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.entries[key] = cacheEntry{data: data, expiresAt: time.Now().Add(cacheTTL)}
}

func (c *ttlCache) invalidate(prefix string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	for k := range c.entries {
		if strings.HasPrefix(k, prefix) {
			delete(c.entries, k)
		}
	}
}

func (c *ttlCache) evict() {
	c.mu.Lock()
	defer c.mu.Unlock()
	now := time.Now()
	for k, e := range c.entries {
		if now.After(e.expiresAt) {
			delete(c.entries, k)
		}
	}
}

var requestCount atomic.Int64

func securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		w.Header().Set("Cache-Control", "no-store")
		w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		next.ServeHTTP(w, r)
	})
}

type store interface {
	List(ctx context.Context, tenantID, cursor string, limit int, filters map[string]string) ([]codeReview, string, error)
	GetByID(ctx context.Context, tenantID, id string) (*codeReview, error)
	Create(ctx context.Context, cr *codeReview) error
	Update(ctx context.Context, cr *codeReview) error
	Delete(ctx context.Context, tenantID, id string) error
}

type memoryStore struct {
	mu      sync.RWMutex
	records map[string]codeReview
}

func newMemoryStore() *memoryStore {
	return &memoryStore{records: make(map[string]codeReview)}
}

func (m *memoryStore) List(_ context.Context, tenantID, cursor string, limit int, filters map[string]string) ([]codeReview, string, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	var all []codeReview
	for _, cr := range m.records {
		if cr.TenantID != tenantID {
			continue
		}
		if v, ok := filters["repository_id"]; ok && strVal(cr.RepositoryID) != v {
			continue
		}
		if v, ok := filters["status"]; ok && cr.Status != v {
			continue
		}
		if v, ok := filters["session_id"]; ok && strVal(cr.SessionID) != v {
			continue
		}
		all = append(all, cr)
	}
	sort.Slice(all, func(i, j int) bool { return all[i].CreatedAt < all[j].CreatedAt })
	start := 0
	if cursor != "" {
		for i, cr := range all {
			if cr.ID == cursor {
				start = i + 1
				break
			}
		}
	}
	if start >= len(all) {
		return []codeReview{}, "", nil
	}
	end := start + limit
	if end > len(all) {
		end = len(all)
	}
	result := all[start:end]
	nextCursor := ""
	if end < len(all) {
		nextCursor = result[len(result)-1].ID
	}
	return result, nextCursor, nil
}

func (m *memoryStore) GetByID(_ context.Context, tenantID, id string) (*codeReview, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	cr, ok := m.records[id]
	if !ok || cr.TenantID != tenantID {
		return nil, errors.New("not found")
	}
	return &cr, nil
}

func (m *memoryStore) Create(_ context.Context, cr *codeReview) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.records[cr.ID] = *cr
	return nil
}

func (m *memoryStore) Update(_ context.Context, cr *codeReview) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, ok := m.records[cr.ID]; !ok {
		return errors.New("not found")
	}
	m.records[cr.ID] = *cr
	return nil
}

func (m *memoryStore) Delete(_ context.Context, tenantID, id string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	cr, ok := m.records[id]
	if !ok || cr.TenantID != tenantID {
		return errors.New("not found")
	}
	delete(m.records, id)
	return nil
}

type postgresStore struct{ db *sql.DB }

func newPostgresStore(dsn string) (*postgresStore, error) {
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		return nil, fmt.Errorf("open db: %w", err)
	}
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := db.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("ping db: %w", err)
	}
	if _, err := db.ExecContext(ctx, createTableSQL); err != nil {
		return nil, fmt.Errorf("create table: %w", err)
	}
	return &postgresStore{db: db}, nil
}

const createTableSQL = `CREATE TABLE IF NOT EXISTS ` + tableName + ` (
	id TEXT PRIMARY KEY,
	tenant_id TEXT NOT NULL,
	session_id TEXT,
	pr_url TEXT,
	repository_id TEXT,
	files_json TEXT,
	findings_json TEXT,
	severity_counts_json TEXT,
	overall_score INT DEFAULT 0,
	security_score INT DEFAULT 0,
	quality_score INT DEFAULT 0,
	performance_score INT DEFAULT 0,
	model_used TEXT,
	status TEXT CHECK (status IN ('pending','in_progress','completed','failed')) DEFAULT 'pending',
	reviewed_at TIMESTAMPTZ,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_` + tableName + `_tenant ON ` + tableName + ` (tenant_id);
CREATE INDEX IF NOT EXISTS idx_` + tableName + `_repo ON ` + tableName + ` (tenant_id, repository_id);
CREATE INDEX IF NOT EXISTS idx_` + tableName + `_status ON ` + tableName + ` (tenant_id, status);`

func (p *postgresStore) List(ctx context.Context, tenantID, cursor string, limit int, filters map[string]string) ([]codeReview, string, error) {
	query := `SELECT id,tenant_id,session_id,pr_url,repository_id,files_json,findings_json,
		severity_counts_json,overall_score,security_score,quality_score,performance_score,
		model_used,status,reviewed_at,created_at,updated_at FROM ` + tableName + ` WHERE tenant_id=$1`
	args := []any{tenantID}
	argIdx := 2
	if v, ok := filters["repository_id"]; ok {
		query += fmt.Sprintf(" AND repository_id=$%d", argIdx)
		args = append(args, v)
		argIdx++
	}
	if v, ok := filters["status"]; ok {
		query += fmt.Sprintf(" AND status=$%d", argIdx)
		args = append(args, v)
		argIdx++
	}
	if v, ok := filters["session_id"]; ok {
		query += fmt.Sprintf(" AND session_id=$%d", argIdx)
		args = append(args, v)
		argIdx++
	}
	if cursor != "" {
		query += fmt.Sprintf(" AND created_at>(SELECT created_at FROM "+tableName+" WHERE id=$%d)", argIdx)
		args = append(args, cursor)
		argIdx++
	}
	query += " ORDER BY created_at ASC"
	query += fmt.Sprintf(" LIMIT $%d", argIdx)
	args = append(args, limit+1)
	rows, err := p.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, "", fmt.Errorf("query: %w", err)
	}
	defer rows.Close()
	var results []codeReview
	for rows.Next() {
		var cr codeReview
		var ca, ua, ra sql.NullTime
		var sid, prurl, rid, fj, findj, scj, mu sql.NullString
		if err := rows.Scan(&cr.ID, &cr.TenantID, &sid, &prurl, &rid, &fj, &findj, &scj,
			&cr.OverallScore, &cr.SecurityScore, &cr.QualityScore, &cr.PerformanceScore,
			&mu, &cr.Status, &ra, &ca, &ua); err != nil {
			return nil, "", fmt.Errorf("scan: %w", err)
		}
		if sid.Valid { cr.SessionID = &sid.String }
		if prurl.Valid { cr.PRURL = &prurl.String }
		if rid.Valid { cr.RepositoryID = &rid.String }
		if fj.Valid { cr.FilesJSON = &fj.String }
		if findj.Valid { cr.FindingsJSON = &findj.String }
		if scj.Valid { cr.SeverityCountsJSON = &scj.String }
		if mu.Valid { cr.ModelUsed = &mu.String }
		if ra.Valid { v := ra.Time.Format(time.RFC3339); cr.ReviewedAt = &v }
		if ca.Valid { cr.CreatedAt = ca.Time.Format(time.RFC3339) }
		if ua.Valid { cr.UpdatedAt = ua.Time.Format(time.RFC3339) }
		results = append(results, cr)
	}
	nextCursor := ""
	if len(results) > limit {
		nextCursor = results[limit-1].ID
		results = results[:limit]
	}
	return results, nextCursor, nil
}

func (p *postgresStore) GetByID(ctx context.Context, tenantID, id string) (*codeReview, error) {
	query := `SELECT id,tenant_id,session_id,pr_url,repository_id,files_json,findings_json,
		severity_counts_json,overall_score,security_score,quality_score,performance_score,
		model_used,status,reviewed_at,created_at,updated_at FROM ` + tableName + ` WHERE id=$1 AND tenant_id=$2`
	var cr codeReview
	var ca, ua, ra sql.NullTime
	var sid, prurl, rid, fj, findj, scj, mu sql.NullString
	err := p.db.QueryRowContext(ctx, query, id, tenantID).Scan(&cr.ID, &cr.TenantID, &sid, &prurl, &rid, &fj, &findj, &scj,
		&cr.OverallScore, &cr.SecurityScore, &cr.QualityScore, &cr.PerformanceScore,
		&mu, &cr.Status, &ra, &ca, &ua)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) { return nil, errors.New("not found") }
		return nil, fmt.Errorf("query row: %w", err)
	}
	if sid.Valid { cr.SessionID = &sid.String }
	if prurl.Valid { cr.PRURL = &prurl.String }
	if rid.Valid { cr.RepositoryID = &rid.String }
	if fj.Valid { cr.FilesJSON = &fj.String }
	if findj.Valid { cr.FindingsJSON = &findj.String }
	if scj.Valid { cr.SeverityCountsJSON = &scj.String }
	if mu.Valid { cr.ModelUsed = &mu.String }
	if ra.Valid { v := ra.Time.Format(time.RFC3339); cr.ReviewedAt = &v }
	if ca.Valid { cr.CreatedAt = ca.Time.Format(time.RFC3339) }
	if ua.Valid { cr.UpdatedAt = ua.Time.Format(time.RFC3339) }
	return &cr, nil
}

func (p *postgresStore) Create(ctx context.Context, cr *codeReview) error {
	query := `INSERT INTO ` + tableName + ` (id,tenant_id,session_id,pr_url,repository_id,files_json,
		findings_json,severity_counts_json,overall_score,security_score,quality_score,
		performance_score,model_used,status,reviewed_at,created_at,updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`
	_, err := p.db.ExecContext(ctx, query, cr.ID, cr.TenantID, cr.SessionID, cr.PRURL, cr.RepositoryID,
		cr.FilesJSON, cr.FindingsJSON, cr.SeverityCountsJSON, cr.OverallScore, cr.SecurityScore,
		cr.QualityScore, cr.PerformanceScore, cr.ModelUsed, cr.Status,
		parseTimePtr(cr.ReviewedAt), parseTime(cr.CreatedAt), parseTime(cr.UpdatedAt))
	return err
}

func (p *postgresStore) Update(ctx context.Context, cr *codeReview) error {
	query := `UPDATE ` + tableName + ` SET session_id=$1,pr_url=$2,repository_id=$3,files_json=$4,
		findings_json=$5,severity_counts_json=$6,overall_score=$7,security_score=$8,
		quality_score=$9,performance_score=$10,model_used=$11,status=$12,reviewed_at=$13,
		updated_at=$14 WHERE id=$15 AND tenant_id=$16`
	res, err := p.db.ExecContext(ctx, query, cr.SessionID, cr.PRURL, cr.RepositoryID, cr.FilesJSON,
		cr.FindingsJSON, cr.SeverityCountsJSON, cr.OverallScore, cr.SecurityScore,
		cr.QualityScore, cr.PerformanceScore, cr.ModelUsed, cr.Status,
		parseTimePtr(cr.ReviewedAt), parseTime(cr.UpdatedAt), cr.ID, cr.TenantID)
	if err != nil { return err }
	n, _ := res.RowsAffected()
	if n == 0 { return errors.New("not found") }
	return nil
}

func (p *postgresStore) Delete(ctx context.Context, tenantID, id string) error {
	res, err := p.db.ExecContext(ctx, `DELETE FROM `+tableName+` WHERE id=$1 AND tenant_id=$2`, id, tenantID)
	if err != nil { return err }
	n, _ := res.RowsAffected()
	if n == 0 { return errors.New("not found") }
	return nil
}

func parseTime(s string) time.Time {
	t, err := time.Parse(time.RFC3339, s)
	if err != nil { return time.Now() }
	return t
}

func parseTimePtr(s *string) *time.Time {
	if s == nil { return nil }
	t, err := time.Parse(time.RFC3339, *s)
	if err != nil { return nil }
	return &t
}

type server struct {
	store store
	cache *ttlCache
}

func (sv *server) handleList(w http.ResponseWriter, r *http.Request) {
	tenantID := r.Header.Get("X-Tenant-ID")
	cursor := r.URL.Query().Get("cursor")
	limit := 20
	if v, err := strconv.Atoi(r.URL.Query().Get("limit")); err == nil && v > 0 && v <= 100 { limit = v }
	filters := make(map[string]string)
	for _, key := range []string{"repository_id", "status", "session_id"} {
		if v := r.URL.Query().Get(key); v != "" { filters[key] = v }
	}
	cacheKey := fmt.Sprintf("list:%s:%s:%d:%v", tenantID, cursor, limit, filters)
	if cached, ok := sv.cache.get(cacheKey); ok { writeJSON(w, http.StatusOK, cached); return }
	items, nextCursor, err := sv.store.List(r.Context(), tenantID, cursor, limit, filters)
	if err != nil { writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()}); return }
	resp := map[string]any{"items": items, "next_cursor": nextCursor, "limit": limit, "count": len(items), "event_topic": eventTopic + ".listed"}
	sv.cache.set(cacheKey, resp)
	writeJSON(w, http.StatusOK, resp)
}

func (sv *server) handleGet(w http.ResponseWriter, r *http.Request, id string) {
	tenantID := r.Header.Get("X-Tenant-ID")
	cacheKey := fmt.Sprintf("get:%s:%s", tenantID, id)
	if cached, ok := sv.cache.get(cacheKey); ok { writeJSON(w, http.StatusOK, cached); return }
	item, err := sv.store.GetByID(r.Context(), tenantID, id)
	if err != nil {
		if err.Error() == "not found" { writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"}); return }
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()}); return
	}
	resp := map[string]any{"item": item, "event_topic": eventTopic + ".read"}
	sv.cache.set(cacheKey, resp)
	writeJSON(w, http.StatusOK, resp)
}

func (sv *server) handleCreate(w http.ResponseWriter, r *http.Request) {
	tenantID := r.Header.Get("X-Tenant-ID")
	body, err := readJSON(r)
	if err != nil { writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON: " + err.Error()}); return }
	now := time.Now().UTC().Format(time.RFC3339)
	cr := &codeReview{
		ID: newID(), TenantID: tenantID, SessionID: strPtr(body["session_id"]),
		PRURL: strPtr(body["pr_url"]), RepositoryID: strPtr(body["repository_id"]),
		FilesJSON: strPtr(body["files_json"]), FindingsJSON: strPtr(body["findings_json"]),
		SeverityCountsJSON: strPtr(body["severity_counts_json"]),
		OverallScore: 0, SecurityScore: 0, QualityScore: 0, PerformanceScore: 0,
		ModelUsed: strPtr(body["model_used"]), Status: "pending", CreatedAt: now, UpdatedAt: now,
	}
	if v, ok := body["overall_score"].(float64); ok { cr.OverallScore = int(v) }
	if v, ok := body["security_score"].(float64); ok { cr.SecurityScore = int(v) }
	if v, ok := body["quality_score"].(float64); ok { cr.QualityScore = int(v) }
	if v, ok := body["performance_score"].(float64); ok { cr.PerformanceScore = int(v) }
	if v, ok := body["status"].(string); ok && validStatuses[v] { cr.Status = v }
	if v, ok := body["reviewed_at"].(string); ok { cr.ReviewedAt = &v }
	if err := sv.store.Create(r.Context(), cr); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()}); return
	}
	sv.cache.invalidate("list:" + tenantID)
	writeJSON(w, http.StatusCreated, map[string]any{"item": cr, "event_topic": eventTopic + ".created"})
}

func (sv *server) handleUpdate(w http.ResponseWriter, r *http.Request, id string) {
	tenantID := r.Header.Get("X-Tenant-ID")
	existing, err := sv.store.GetByID(r.Context(), tenantID, id)
	if err != nil {
		if err.Error() == "not found" { writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"}); return }
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()}); return
	}
	body, err := readJSON(r)
	if err != nil { writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON: " + err.Error()}); return }
	if v, exists := body["session_id"]; exists { existing.SessionID = strPtr(v) }
	if v, exists := body["pr_url"]; exists { existing.PRURL = strPtr(v) }
	if v, exists := body["repository_id"]; exists { existing.RepositoryID = strPtr(v) }
	if v, exists := body["files_json"]; exists { existing.FilesJSON = strPtr(v) }
	if v, exists := body["findings_json"]; exists { existing.FindingsJSON = strPtr(v) }
	if v, exists := body["severity_counts_json"]; exists { existing.SeverityCountsJSON = strPtr(v) }
	if v, ok := body["overall_score"].(float64); ok { existing.OverallScore = int(v) }
	if v, ok := body["security_score"].(float64); ok { existing.SecurityScore = int(v) }
	if v, ok := body["quality_score"].(float64); ok { existing.QualityScore = int(v) }
	if v, ok := body["performance_score"].(float64); ok { existing.PerformanceScore = int(v) }
	if v, exists := body["model_used"]; exists { existing.ModelUsed = strPtr(v) }
	if v, ok := body["status"].(string); ok && validStatuses[v] { existing.Status = v }
	if v, ok := body["reviewed_at"].(string); ok { existing.ReviewedAt = &v }
	existing.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
	if err := sv.store.Update(r.Context(), existing); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()}); return
	}
	sv.cache.invalidate("list:" + tenantID)
	sv.cache.invalidate("get:" + tenantID + ":" + id)
	writeJSON(w, http.StatusOK, map[string]any{"item": existing, "event_topic": eventTopic + ".updated"})
}

func (sv *server) handleDelete(w http.ResponseWriter, r *http.Request, id string) {
	tenantID := r.Header.Get("X-Tenant-ID")
	if err := sv.store.Delete(r.Context(), tenantID, id); err != nil {
		if err.Error() == "not found" { writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"}); return }
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()}); return
	}
	sv.cache.invalidate("list:" + tenantID)
	sv.cache.invalidate("get:" + tenantID + ":" + id)
	writeJSON(w, http.StatusOK, map[string]any{"deleted": true, "id": id, "event_topic": eventTopic + ".deleted"})
}

func handleExplain(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"service": serviceName, "module": moduleName, "base_path": basePath,
		"database": dbName, "table": tableName, "event_topic": eventTopic, "entity": "codeReview",
		"fields": []string{"id", "tenant_id", "session_id", "pr_url", "repository_id", "files_json",
			"findings_json", "severity_counts_json", "overall_score", "security_score",
			"quality_score", "performance_score", "model_used", "status", "reviewed_at",
			"created_at", "updated_at"},
		"filters": []string{"repository_id", "status", "session_id"}, "pagination": "cursor-based",
		"cache_ttl": cacheTTL.String(),
		"endpoints": map[string]string{
			"list": "GET " + basePath, "get": "GET " + basePath + "/{id}",
			"create": "POST " + basePath, "update": "PUT/PATCH " + basePath + "/{id}",
			"delete": "DELETE " + basePath + "/{id}",
		},
	})
}

func main() {
	port := os.Getenv("PORT")
	if port == "" { port = "8080" }
	var st store
	dsn := os.Getenv("DATABASE_URL")
	if dsn != "" {
		pg, err := newPostgresStore(dsn)
		if err != nil { log.Fatalf("postgres: %v", err) }
		st = pg
		log.Println("Using PostgreSQL store")
	} else {
		st = newMemoryStore()
		log.Println("Using in-memory store (set DATABASE_URL for PostgreSQL)")
	}
	cache := newCache()
	srv := &server{store: st, cache: cache}
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "healthy", "module": moduleName, "service": serviceName})
	})
	mux.HandleFunc("/readyz", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ready"})
	})
	mux.HandleFunc("/metrics", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]any{"requests_total": requestCount.Load(), "service": serviceName})
	})
	mux.HandleFunc(basePath+"/_explain", handleExplain)
	mux.HandleFunc(basePath, func(w http.ResponseWriter, r *http.Request) {
		requestCount.Add(1)
		if r.Header.Get("X-Tenant-ID") == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "missing X-Tenant-ID header"}); return
		}
		switch r.Method {
		case http.MethodGet: srv.handleList(w, r)
		case http.MethodPost: srv.handleCreate(w, r)
		default: writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		}
	})
	mux.HandleFunc(basePath+"/", func(w http.ResponseWriter, r *http.Request) {
		requestCount.Add(1)
		if r.Header.Get("X-Tenant-ID") == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "missing X-Tenant-ID header"}); return
		}
		id := strings.TrimPrefix(r.URL.Path, basePath+"/")
		if id == "" { writeJSON(w, http.StatusBadRequest, map[string]string{"error": "missing id"}); return }
		switch r.Method {
		case http.MethodGet: srv.handleGet(w, r, id)
		case http.MethodPut, http.MethodPatch: srv.handleUpdate(w, r, id)
		case http.MethodDelete: srv.handleDelete(w, r, id)
		default: writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		}
	})
	handler := securityHeaders(mux)
	log.Printf("%s listening on :%s", serviceName, port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
