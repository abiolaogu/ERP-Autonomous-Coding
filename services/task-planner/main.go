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
	serviceName = "task-planner"
	moduleName  = "ERP-Autonomous-Coding"
	basePath    = "/v1/coding-plans"
	dbName      = "erp_coding"
	tableName   = "coding_plans"
	eventTopic  = "erp.coding.plan"
	cacheTTL    = 45 * time.Second
)

var validStatuses = map[string]bool{"draft": true, "planning": true, "ready": true, "in_progress": true, "completed": true, "abandoned": true}

type codingPlan struct {
	ID               string  `json:"id"`
	TenantID         string  `json:"tenant_id"`
	UserID           string  `json:"user_id"`
	Title            string  `json:"title"`
	Description      *string `json:"description,omitempty"`
	RequirementsJSON *string `json:"requirements_json,omitempty"`
	StepsJSON        *string `json:"steps_json,omitempty"`
	DependenciesJSON *string `json:"dependencies_json,omitempty"`
	EstimatedEffort  *string `json:"estimated_effort,omitempty"`
	Language         *string `json:"language,omitempty"`
	Framework        *string `json:"framework,omitempty"`
	TotalSteps       int     `json:"total_steps"`
	CompletedSteps   int     `json:"completed_steps"`
	Status           string  `json:"status"`
	ModelUsed        *string `json:"model_used,omitempty"`
	CreatedAt        string  `json:"created_at"`
	UpdatedAt        string  `json:"updated_at"`
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
	List(ctx context.Context, tenantID, cursor string, limit int, filters map[string]string) ([]codingPlan, string, error)
	GetByID(ctx context.Context, tenantID, id string) (*codingPlan, error)
	Create(ctx context.Context, p *codingPlan) error
	Update(ctx context.Context, p *codingPlan) error
	Delete(ctx context.Context, tenantID, id string) error
}

type memoryStore struct {
	mu      sync.RWMutex
	records map[string]codingPlan
}

func newMemoryStore() *memoryStore {
	return &memoryStore{records: make(map[string]codingPlan)}
}

func (m *memoryStore) List(_ context.Context, tenantID, cursor string, limit int, filters map[string]string) ([]codingPlan, string, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	var all []codingPlan
	for _, p := range m.records {
		if p.TenantID != tenantID {
			continue
		}
		if v, ok := filters["user_id"]; ok && p.UserID != v {
			continue
		}
		if v, ok := filters["status"]; ok && p.Status != v {
			continue
		}
		if v, ok := filters["language"]; ok && strVal(p.Language) != v {
			continue
		}
		all = append(all, p)
	}
	sort.Slice(all, func(i, j int) bool { return all[i].CreatedAt < all[j].CreatedAt })
	start := 0
	if cursor != "" {
		for i, p := range all {
			if p.ID == cursor {
				start = i + 1
				break
			}
		}
	}
	if start >= len(all) {
		return []codingPlan{}, "", nil
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

func (m *memoryStore) GetByID(_ context.Context, tenantID, id string) (*codingPlan, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	p, ok := m.records[id]
	if !ok || p.TenantID != tenantID {
		return nil, errors.New("not found")
	}
	return &p, nil
}

func (m *memoryStore) Create(_ context.Context, p *codingPlan) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.records[p.ID] = *p
	return nil
}

func (m *memoryStore) Update(_ context.Context, p *codingPlan) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, ok := m.records[p.ID]; !ok {
		return errors.New("not found")
	}
	m.records[p.ID] = *p
	return nil
}

func (m *memoryStore) Delete(_ context.Context, tenantID, id string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	p, ok := m.records[id]
	if !ok || p.TenantID != tenantID {
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
	user_id TEXT NOT NULL,
	title TEXT NOT NULL,
	description TEXT,
	requirements_json TEXT,
	steps_json TEXT,
	dependencies_json TEXT,
	estimated_effort TEXT,
	language TEXT,
	framework TEXT,
	total_steps INT DEFAULT 0,
	completed_steps INT DEFAULT 0,
	status TEXT CHECK (status IN ('draft','planning','ready','in_progress','completed','abandoned')) DEFAULT 'draft',
	model_used TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_` + tableName + `_tenant ON ` + tableName + ` (tenant_id);
CREATE INDEX IF NOT EXISTS idx_` + tableName + `_user ON ` + tableName + ` (tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_` + tableName + `_status ON ` + tableName + ` (tenant_id, status);`

func (p *postgresStore) List(ctx context.Context, tenantID, cursor string, limit int, filters map[string]string) ([]codingPlan, string, error) {
	query := `SELECT id,tenant_id,user_id,title,description,requirements_json,steps_json,
		dependencies_json,estimated_effort,language,framework,total_steps,completed_steps,
		status,model_used,created_at,updated_at FROM ` + tableName + ` WHERE tenant_id=$1`
	args := []any{tenantID}
	argIdx := 2
	if v, ok := filters["user_id"]; ok {
		query += fmt.Sprintf(" AND user_id=$%d", argIdx); args = append(args, v); argIdx++
	}
	if v, ok := filters["status"]; ok {
		query += fmt.Sprintf(" AND status=$%d", argIdx); args = append(args, v); argIdx++
	}
	if v, ok := filters["language"]; ok {
		query += fmt.Sprintf(" AND language=$%d", argIdx); args = append(args, v); argIdx++
	}
	if cursor != "" {
		query += fmt.Sprintf(" AND created_at>(SELECT created_at FROM "+tableName+" WHERE id=$%d)", argIdx)
		args = append(args, cursor); argIdx++
	}
	query += " ORDER BY created_at ASC"
	query += fmt.Sprintf(" LIMIT $%d", argIdx)
	args = append(args, limit+1)
	rows, err := p.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, "", fmt.Errorf("query: %w", err)
	}
	defer rows.Close()
	var results []codingPlan
	for rows.Next() {
		var pl codingPlan
		var ca, ua sql.NullTime
		var desc, rj, sj, dj, ee, lang, fw, mu sql.NullString
		if err := rows.Scan(&pl.ID, &pl.TenantID, &pl.UserID, &pl.Title, &desc, &rj, &sj, &dj,
			&ee, &lang, &fw, &pl.TotalSteps, &pl.CompletedSteps, &pl.Status, &mu, &ca, &ua); err != nil {
			return nil, "", fmt.Errorf("scan: %w", err)
		}
		if desc.Valid { pl.Description = &desc.String }
		if rj.Valid { pl.RequirementsJSON = &rj.String }
		if sj.Valid { pl.StepsJSON = &sj.String }
		if dj.Valid { pl.DependenciesJSON = &dj.String }
		if ee.Valid { pl.EstimatedEffort = &ee.String }
		if lang.Valid { pl.Language = &lang.String }
		if fw.Valid { pl.Framework = &fw.String }
		if mu.Valid { pl.ModelUsed = &mu.String }
		if ca.Valid { pl.CreatedAt = ca.Time.Format(time.RFC3339) }
		if ua.Valid { pl.UpdatedAt = ua.Time.Format(time.RFC3339) }
		results = append(results, pl)
	}
	nextCursor := ""
	if len(results) > limit {
		nextCursor = results[limit-1].ID
		results = results[:limit]
	}
	return results, nextCursor, nil
}

func (p *postgresStore) GetByID(ctx context.Context, tenantID, id string) (*codingPlan, error) {
	query := `SELECT id,tenant_id,user_id,title,description,requirements_json,steps_json,
		dependencies_json,estimated_effort,language,framework,total_steps,completed_steps,
		status,model_used,created_at,updated_at FROM ` + tableName + ` WHERE id=$1 AND tenant_id=$2`
	var pl codingPlan
	var ca, ua sql.NullTime
	var desc, rj, sj, dj, ee, lang, fw, mu sql.NullString
	err := p.db.QueryRowContext(ctx, query, id, tenantID).Scan(&pl.ID, &pl.TenantID, &pl.UserID,
		&pl.Title, &desc, &rj, &sj, &dj, &ee, &lang, &fw, &pl.TotalSteps, &pl.CompletedSteps,
		&pl.Status, &mu, &ca, &ua)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) { return nil, errors.New("not found") }
		return nil, fmt.Errorf("query row: %w", err)
	}
	if desc.Valid { pl.Description = &desc.String }
	if rj.Valid { pl.RequirementsJSON = &rj.String }
	if sj.Valid { pl.StepsJSON = &sj.String }
	if dj.Valid { pl.DependenciesJSON = &dj.String }
	if ee.Valid { pl.EstimatedEffort = &ee.String }
	if lang.Valid { pl.Language = &lang.String }
	if fw.Valid { pl.Framework = &fw.String }
	if mu.Valid { pl.ModelUsed = &mu.String }
	if ca.Valid { pl.CreatedAt = ca.Time.Format(time.RFC3339) }
	if ua.Valid { pl.UpdatedAt = ua.Time.Format(time.RFC3339) }
	return &pl, nil
}

func (p *postgresStore) Create(ctx context.Context, pl *codingPlan) error {
	query := `INSERT INTO ` + tableName + ` (id,tenant_id,user_id,title,description,
		requirements_json,steps_json,dependencies_json,estimated_effort,language,framework,
		total_steps,completed_steps,status,model_used,created_at,updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`
	_, err := p.db.ExecContext(ctx, query, pl.ID, pl.TenantID, pl.UserID, pl.Title, pl.Description,
		pl.RequirementsJSON, pl.StepsJSON, pl.DependenciesJSON, pl.EstimatedEffort,
		pl.Language, pl.Framework, pl.TotalSteps, pl.CompletedSteps, pl.Status, pl.ModelUsed,
		parseTime(pl.CreatedAt), parseTime(pl.UpdatedAt))
	return err
}

func (p *postgresStore) Update(ctx context.Context, pl *codingPlan) error {
	query := `UPDATE ` + tableName + ` SET user_id=$1,title=$2,description=$3,requirements_json=$4,
		steps_json=$5,dependencies_json=$6,estimated_effort=$7,language=$8,framework=$9,
		total_steps=$10,completed_steps=$11,status=$12,model_used=$13,updated_at=$14
		WHERE id=$15 AND tenant_id=$16`
	res, err := p.db.ExecContext(ctx, query, pl.UserID, pl.Title, pl.Description,
		pl.RequirementsJSON, pl.StepsJSON, pl.DependenciesJSON, pl.EstimatedEffort,
		pl.Language, pl.Framework, pl.TotalSteps, pl.CompletedSteps, pl.Status, pl.ModelUsed,
		parseTime(pl.UpdatedAt), pl.ID, pl.TenantID)
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
	for _, key := range []string{"user_id", "status", "language"} {
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
	userID, _ := body["user_id"].(string)
	if userID == "" { writeJSON(w, http.StatusBadRequest, map[string]string{"error": "user_id is required"}); return }
	title, _ := body["title"].(string)
	if title == "" { writeJSON(w, http.StatusBadRequest, map[string]string{"error": "title is required"}); return }
	now := time.Now().UTC().Format(time.RFC3339)
	pl := &codingPlan{
		ID: newID(), TenantID: tenantID, UserID: userID, Title: title,
		Description: strPtr(body["description"]), RequirementsJSON: strPtr(body["requirements_json"]),
		StepsJSON: strPtr(body["steps_json"]), DependenciesJSON: strPtr(body["dependencies_json"]),
		EstimatedEffort: strPtr(body["estimated_effort"]), Language: strPtr(body["language"]),
		Framework: strPtr(body["framework"]), TotalSteps: 0, CompletedSteps: 0, Status: "draft",
		ModelUsed: strPtr(body["model_used"]), CreatedAt: now, UpdatedAt: now,
	}
	if v, ok := body["total_steps"].(float64); ok { pl.TotalSteps = int(v) }
	if v, ok := body["completed_steps"].(float64); ok { pl.CompletedSteps = int(v) }
	if v, ok := body["status"].(string); ok && validStatuses[v] { pl.Status = v }
	if err := sv.store.Create(r.Context(), pl); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()}); return
	}
	sv.cache.invalidate("list:" + tenantID)
	writeJSON(w, http.StatusCreated, map[string]any{"item": pl, "event_topic": eventTopic + ".created"})
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
	if v, ok := body["user_id"].(string); ok && v != "" { existing.UserID = v }
	if v, ok := body["title"].(string); ok && v != "" { existing.Title = v }
	if v, exists := body["description"]; exists { existing.Description = strPtr(v) }
	if v, exists := body["requirements_json"]; exists { existing.RequirementsJSON = strPtr(v) }
	if v, exists := body["steps_json"]; exists { existing.StepsJSON = strPtr(v) }
	if v, exists := body["dependencies_json"]; exists { existing.DependenciesJSON = strPtr(v) }
	if v, exists := body["estimated_effort"]; exists { existing.EstimatedEffort = strPtr(v) }
	if v, exists := body["language"]; exists { existing.Language = strPtr(v) }
	if v, exists := body["framework"]; exists { existing.Framework = strPtr(v) }
	if v, ok := body["total_steps"].(float64); ok { existing.TotalSteps = int(v) }
	if v, ok := body["completed_steps"].(float64); ok { existing.CompletedSteps = int(v) }
	if v, ok := body["status"].(string); ok && validStatuses[v] { existing.Status = v }
	if v, exists := body["model_used"]; exists { existing.ModelUsed = strPtr(v) }
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
		"database": dbName, "table": tableName, "event_topic": eventTopic, "entity": "codingPlan",
		"fields": []string{"id", "tenant_id", "user_id", "title", "description",
			"requirements_json", "steps_json", "dependencies_json", "estimated_effort",
			"language", "framework", "total_steps", "completed_steps", "status", "model_used",
			"created_at", "updated_at"},
		"filters": []string{"user_id", "status", "language"}, "pagination": "cursor-based",
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
		if r.Header.Get("X-Tenant-ID") == "" { writeJSON(w, http.StatusBadRequest, map[string]string{"error": "missing X-Tenant-ID header"}); return }
		switch r.Method {
		case http.MethodGet: srv.handleList(w, r)
		case http.MethodPost: srv.handleCreate(w, r)
		default: writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		}
	})
	mux.HandleFunc(basePath+"/", func(w http.ResponseWriter, r *http.Request) {
		requestCount.Add(1)
		if r.Header.Get("X-Tenant-ID") == "" { writeJSON(w, http.StatusBadRequest, map[string]string{"error": "missing X-Tenant-ID header"}); return }
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
