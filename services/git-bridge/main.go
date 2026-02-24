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
	serviceName = "git-bridge"
	moduleName  = "ERP-Autonomous-Coding"
	basePath    = "/v1/repositories"
	dbName      = "erp_coding"
	tableName   = "coding_repositories"
	eventTopic  = "erp.coding.repository"
	cacheTTL    = 45 * time.Second
)

var (
	validProviders = map[string]bool{"github": true, "gitlab": true, "bitbucket": true, "azure_devops": true, "self_hosted": true}
	validStatuses  = map[string]bool{"connected": true, "disconnected": true, "syncing": true, "error": true}
)

type repository struct {
	ID               string  `json:"id"`
	TenantID         string  `json:"tenant_id"`
	Name             string  `json:"name"`
	URL              string  `json:"url"`
	Provider         string  `json:"provider"`
	DefaultBranch    string  `json:"default_branch"`
	AccessTokenRef   *string `json:"access_token_ref,omitempty"`
	WebhookSecretRef *string `json:"webhook_secret_ref,omitempty"`
	LastSyncedAt     *string `json:"last_synced_at,omitempty"`
	CommitCount      int     `json:"commit_count"`
	BranchCount      int     `json:"branch_count"`
	OpenPRCount      int     `json:"open_pr_count"`
	Status           string  `json:"status"`
	ConfigJSON       *string `json:"config_json,omitempty"`
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
	List(ctx context.Context, tenantID, cursor string, limit int, filters map[string]string) ([]repository, string, error)
	GetByID(ctx context.Context, tenantID, id string) (*repository, error)
	Create(ctx context.Context, r *repository) error
	Update(ctx context.Context, r *repository) error
	Delete(ctx context.Context, tenantID, id string) error
}

type memoryStore struct {
	mu      sync.RWMutex
	records map[string]repository
}

func newMemoryStore() *memoryStore {
	return &memoryStore{records: make(map[string]repository)}
}

func (m *memoryStore) List(_ context.Context, tenantID, cursor string, limit int, filters map[string]string) ([]repository, string, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	var all []repository
	for _, r := range m.records {
		if r.TenantID != tenantID {
			continue
		}
		if v, ok := filters["provider"]; ok && r.Provider != v {
			continue
		}
		if v, ok := filters["status"]; ok && r.Status != v {
			continue
		}
		all = append(all, r)
	}
	sort.Slice(all, func(i, j int) bool { return all[i].CreatedAt < all[j].CreatedAt })
	start := 0
	if cursor != "" {
		for i, r := range all {
			if r.ID == cursor {
				start = i + 1
				break
			}
		}
	}
	if start >= len(all) {
		return []repository{}, "", nil
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

func (m *memoryStore) GetByID(_ context.Context, tenantID, id string) (*repository, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	r, ok := m.records[id]
	if !ok || r.TenantID != tenantID {
		return nil, errors.New("not found")
	}
	return &r, nil
}

func (m *memoryStore) Create(_ context.Context, r *repository) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.records[r.ID] = *r
	return nil
}

func (m *memoryStore) Update(_ context.Context, r *repository) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, ok := m.records[r.ID]; !ok {
		return errors.New("not found")
	}
	m.records[r.ID] = *r
	return nil
}

func (m *memoryStore) Delete(_ context.Context, tenantID, id string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	r, ok := m.records[id]
	if !ok || r.TenantID != tenantID {
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
	name TEXT NOT NULL,
	url TEXT NOT NULL,
	provider TEXT CHECK (provider IN ('github','gitlab','bitbucket','azure_devops','self_hosted')) NOT NULL,
	default_branch TEXT DEFAULT 'main',
	access_token_ref TEXT,
	webhook_secret_ref TEXT,
	last_synced_at TIMESTAMPTZ,
	commit_count INT DEFAULT 0,
	branch_count INT DEFAULT 0,
	open_pr_count INT DEFAULT 0,
	status TEXT CHECK (status IN ('connected','disconnected','syncing','error')) DEFAULT 'disconnected',
	config_json TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_` + tableName + `_tenant ON ` + tableName + ` (tenant_id);
CREATE INDEX IF NOT EXISTS idx_` + tableName + `_provider ON ` + tableName + ` (tenant_id, provider);
CREATE INDEX IF NOT EXISTS idx_` + tableName + `_status ON ` + tableName + ` (tenant_id, status);`

func (p *postgresStore) List(ctx context.Context, tenantID, cursor string, limit int, filters map[string]string) ([]repository, string, error) {
	query := `SELECT id,tenant_id,name,url,provider,default_branch,access_token_ref,webhook_secret_ref,
		last_synced_at,commit_count,branch_count,open_pr_count,status,config_json,created_at,updated_at
		FROM ` + tableName + ` WHERE tenant_id=$1`
	args := []any{tenantID}
	argIdx := 2
	if v, ok := filters["provider"]; ok {
		query += fmt.Sprintf(" AND provider=$%d", argIdx)
		args = append(args, v)
		argIdx++
	}
	if v, ok := filters["status"]; ok {
		query += fmt.Sprintf(" AND status=$%d", argIdx)
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
	var results []repository
	for rows.Next() {
		var r repository
		var ca, ua, ls sql.NullTime
		var atr, wsr, cj sql.NullString
		if err := rows.Scan(&r.ID, &r.TenantID, &r.Name, &r.URL, &r.Provider, &r.DefaultBranch,
			&atr, &wsr, &ls, &r.CommitCount, &r.BranchCount, &r.OpenPRCount, &r.Status, &cj,
			&ca, &ua); err != nil {
			return nil, "", fmt.Errorf("scan: %w", err)
		}
		if atr.Valid {
			r.AccessTokenRef = &atr.String
		}
		if wsr.Valid {
			r.WebhookSecretRef = &wsr.String
		}
		if ls.Valid {
			v := ls.Time.Format(time.RFC3339)
			r.LastSyncedAt = &v
		}
		if cj.Valid {
			r.ConfigJSON = &cj.String
		}
		if ca.Valid {
			r.CreatedAt = ca.Time.Format(time.RFC3339)
		}
		if ua.Valid {
			r.UpdatedAt = ua.Time.Format(time.RFC3339)
		}
		results = append(results, r)
	}
	nextCursor := ""
	if len(results) > limit {
		nextCursor = results[limit-1].ID
		results = results[:limit]
	}
	return results, nextCursor, nil
}

func (p *postgresStore) GetByID(ctx context.Context, tenantID, id string) (*repository, error) {
	query := `SELECT id,tenant_id,name,url,provider,default_branch,access_token_ref,webhook_secret_ref,
		last_synced_at,commit_count,branch_count,open_pr_count,status,config_json,created_at,updated_at
		FROM ` + tableName + ` WHERE id=$1 AND tenant_id=$2`
	var r repository
	var ca, ua, ls sql.NullTime
	var atr, wsr, cj sql.NullString
	err := p.db.QueryRowContext(ctx, query, id, tenantID).Scan(&r.ID, &r.TenantID, &r.Name, &r.URL, &r.Provider, &r.DefaultBranch,
		&atr, &wsr, &ls, &r.CommitCount, &r.BranchCount, &r.OpenPRCount, &r.Status, &cj, &ca, &ua)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("not found")
		}
		return nil, fmt.Errorf("query row: %w", err)
	}
	if atr.Valid {
		r.AccessTokenRef = &atr.String
	}
	if wsr.Valid {
		r.WebhookSecretRef = &wsr.String
	}
	if ls.Valid {
		v := ls.Time.Format(time.RFC3339)
		r.LastSyncedAt = &v
	}
	if cj.Valid {
		r.ConfigJSON = &cj.String
	}
	if ca.Valid {
		r.CreatedAt = ca.Time.Format(time.RFC3339)
	}
	if ua.Valid {
		r.UpdatedAt = ua.Time.Format(time.RFC3339)
	}
	return &r, nil
}

func (p *postgresStore) Create(ctx context.Context, r *repository) error {
	query := `INSERT INTO ` + tableName + ` (id,tenant_id,name,url,provider,default_branch,
		access_token_ref,webhook_secret_ref,last_synced_at,commit_count,branch_count,
		open_pr_count,status,config_json,created_at,updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`
	_, err := p.db.ExecContext(ctx, query, r.ID, r.TenantID, r.Name, r.URL, r.Provider, r.DefaultBranch,
		r.AccessTokenRef, r.WebhookSecretRef, parseTimePtr(r.LastSyncedAt),
		r.CommitCount, r.BranchCount, r.OpenPRCount, r.Status, r.ConfigJSON,
		parseTime(r.CreatedAt), parseTime(r.UpdatedAt))
	return err
}

func (p *postgresStore) Update(ctx context.Context, r *repository) error {
	query := `UPDATE ` + tableName + ` SET name=$1,url=$2,provider=$3,default_branch=$4,
		access_token_ref=$5,webhook_secret_ref=$6,last_synced_at=$7,commit_count=$8,
		branch_count=$9,open_pr_count=$10,status=$11,config_json=$12,updated_at=$13
		WHERE id=$14 AND tenant_id=$15`
	res, err := p.db.ExecContext(ctx, query, r.Name, r.URL, r.Provider, r.DefaultBranch,
		r.AccessTokenRef, r.WebhookSecretRef, parseTimePtr(r.LastSyncedAt),
		r.CommitCount, r.BranchCount, r.OpenPRCount, r.Status, r.ConfigJSON,
		parseTime(r.UpdatedAt), r.ID, r.TenantID)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return errors.New("not found")
	}
	return nil
}

func (p *postgresStore) Delete(ctx context.Context, tenantID, id string) error {
	res, err := p.db.ExecContext(ctx, `DELETE FROM `+tableName+` WHERE id=$1 AND tenant_id=$2`, id, tenantID)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return errors.New("not found")
	}
	return nil
}

func parseTime(s string) time.Time {
	t, err := time.Parse(time.RFC3339, s)
	if err != nil {
		return time.Now()
	}
	return t
}

func parseTimePtr(s *string) *time.Time {
	if s == nil {
		return nil
	}
	t, err := time.Parse(time.RFC3339, *s)
	if err != nil {
		return nil
	}
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
	if v, err := strconv.Atoi(r.URL.Query().Get("limit")); err == nil && v > 0 && v <= 100 {
		limit = v
	}
	filters := make(map[string]string)
	for _, key := range []string{"provider", "status"} {
		if v := r.URL.Query().Get(key); v != "" {
			filters[key] = v
		}
	}
	cacheKey := fmt.Sprintf("list:%s:%s:%d:%v", tenantID, cursor, limit, filters)
	if cached, ok := sv.cache.get(cacheKey); ok {
		writeJSON(w, http.StatusOK, cached)
		return
	}
	items, nextCursor, err := sv.store.List(r.Context(), tenantID, cursor, limit, filters)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	resp := map[string]any{"items": items, "next_cursor": nextCursor, "limit": limit, "count": len(items), "event_topic": eventTopic + ".listed"}
	sv.cache.set(cacheKey, resp)
	writeJSON(w, http.StatusOK, resp)
}

func (sv *server) handleGet(w http.ResponseWriter, r *http.Request, id string) {
	tenantID := r.Header.Get("X-Tenant-ID")
	cacheKey := fmt.Sprintf("get:%s:%s", tenantID, id)
	if cached, ok := sv.cache.get(cacheKey); ok {
		writeJSON(w, http.StatusOK, cached)
		return
	}
	item, err := sv.store.GetByID(r.Context(), tenantID, id)
	if err != nil {
		if err.Error() == "not found" {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	resp := map[string]any{"item": item, "event_topic": eventTopic + ".read"}
	sv.cache.set(cacheKey, resp)
	writeJSON(w, http.StatusOK, resp)
}

func (sv *server) handleCreate(w http.ResponseWriter, r *http.Request) {
	tenantID := r.Header.Get("X-Tenant-ID")
	body, err := readJSON(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON: " + err.Error()})
		return
	}
	name, _ := body["name"].(string)
	if name == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "name is required"})
		return
	}
	url, _ := body["url"].(string)
	if url == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "url is required"})
		return
	}
	provider, _ := body["provider"].(string)
	if !validProviders[provider] {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "provider is required and must be one of: github, gitlab, bitbucket, azure_devops, self_hosted"})
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	repo := &repository{
		ID: newID(), TenantID: tenantID, Name: name, URL: url, Provider: provider,
		DefaultBranch: "main", AccessTokenRef: strPtr(body["access_token_ref"]),
		WebhookSecretRef: strPtr(body["webhook_secret_ref"]), CommitCount: 0,
		BranchCount: 0, OpenPRCount: 0, Status: "disconnected",
		ConfigJSON: strPtr(body["config_json"]), CreatedAt: now, UpdatedAt: now,
	}
	if v, ok := body["default_branch"].(string); ok && v != "" {
		repo.DefaultBranch = v
	}
	if v, ok := body["status"].(string); ok && validStatuses[v] {
		repo.Status = v
	}
	if v, ok := body["commit_count"].(float64); ok {
		repo.CommitCount = int(v)
	}
	if v, ok := body["branch_count"].(float64); ok {
		repo.BranchCount = int(v)
	}
	if v, ok := body["open_pr_count"].(float64); ok {
		repo.OpenPRCount = int(v)
	}
	if v, ok := body["last_synced_at"].(string); ok {
		repo.LastSyncedAt = &v
	}
	if err := sv.store.Create(r.Context(), repo); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	sv.cache.invalidate("list:" + tenantID)
	writeJSON(w, http.StatusCreated, map[string]any{"item": repo, "event_topic": eventTopic + ".created"})
}

func (sv *server) handleUpdate(w http.ResponseWriter, r *http.Request, id string) {
	tenantID := r.Header.Get("X-Tenant-ID")
	existing, err := sv.store.GetByID(r.Context(), tenantID, id)
	if err != nil {
		if err.Error() == "not found" {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	body, err := readJSON(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON: " + err.Error()})
		return
	}
	if v, ok := body["name"].(string); ok && v != "" {
		existing.Name = v
	}
	if v, ok := body["url"].(string); ok && v != "" {
		existing.URL = v
	}
	if v, ok := body["provider"].(string); ok && validProviders[v] {
		existing.Provider = v
	}
	if v, ok := body["default_branch"].(string); ok && v != "" {
		existing.DefaultBranch = v
	}
	if v, exists := body["access_token_ref"]; exists {
		existing.AccessTokenRef = strPtr(v)
	}
	if v, exists := body["webhook_secret_ref"]; exists {
		existing.WebhookSecretRef = strPtr(v)
	}
	if v, ok := body["last_synced_at"].(string); ok {
		existing.LastSyncedAt = &v
	}
	if v, ok := body["commit_count"].(float64); ok {
		existing.CommitCount = int(v)
	}
	if v, ok := body["branch_count"].(float64); ok {
		existing.BranchCount = int(v)
	}
	if v, ok := body["open_pr_count"].(float64); ok {
		existing.OpenPRCount = int(v)
	}
	if v, ok := body["status"].(string); ok && validStatuses[v] {
		existing.Status = v
	}
	if v, exists := body["config_json"]; exists {
		existing.ConfigJSON = strPtr(v)
	}
	existing.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
	if err := sv.store.Update(r.Context(), existing); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	sv.cache.invalidate("list:" + tenantID)
	sv.cache.invalidate("get:" + tenantID + ":" + id)
	writeJSON(w, http.StatusOK, map[string]any{"item": existing, "event_topic": eventTopic + ".updated"})
}

func (sv *server) handleDelete(w http.ResponseWriter, r *http.Request, id string) {
	tenantID := r.Header.Get("X-Tenant-ID")
	if err := sv.store.Delete(r.Context(), tenantID, id); err != nil {
		if err.Error() == "not found" {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	sv.cache.invalidate("list:" + tenantID)
	sv.cache.invalidate("get:" + tenantID + ":" + id)
	writeJSON(w, http.StatusOK, map[string]any{"deleted": true, "id": id, "event_topic": eventTopic + ".deleted"})
}

func handleExplain(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"service": serviceName, "module": moduleName, "base_path": basePath,
		"database": dbName, "table": tableName, "event_topic": eventTopic, "entity": "repository",
		"fields": []string{"id", "tenant_id", "name", "url", "provider", "default_branch",
			"access_token_ref", "webhook_secret_ref", "last_synced_at", "commit_count",
			"branch_count", "open_pr_count", "status", "config_json", "created_at", "updated_at"},
		"filters": []string{"provider", "status"}, "pagination": "cursor-based", "cache_ttl": cacheTTL.String(),
		"endpoints": map[string]string{
			"list": "GET " + basePath, "get": "GET " + basePath + "/{id}",
			"create": "POST " + basePath, "update": "PUT/PATCH " + basePath + "/{id}",
			"delete": "DELETE " + basePath + "/{id}",
		},
	})
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	var st store
	dsn := os.Getenv("DATABASE_URL")
	if dsn != "" {
		pg, err := newPostgresStore(dsn)
		if err != nil {
			log.Fatalf("postgres: %v", err)
		}
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
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "missing X-Tenant-ID header"})
			return
		}
		switch r.Method {
		case http.MethodGet:
			srv.handleList(w, r)
		case http.MethodPost:
			srv.handleCreate(w, r)
		default:
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		}
	})
	mux.HandleFunc(basePath+"/", func(w http.ResponseWriter, r *http.Request) {
		requestCount.Add(1)
		if r.Header.Get("X-Tenant-ID") == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "missing X-Tenant-ID header"})
			return
		}
		id := strings.TrimPrefix(r.URL.Path, basePath+"/")
		if id == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "missing id"})
			return
		}
		switch r.Method {
		case http.MethodGet:
			srv.handleGet(w, r, id)
		case http.MethodPut, http.MethodPatch:
			srv.handleUpdate(w, r, id)
		case http.MethodDelete:
			srv.handleDelete(w, r, id)
		default:
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		}
	})
	handler := securityHeaders(mux)
	log.Printf("%s listening on :%s", serviceName, port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
