package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func setupTestServer() (*server, *http.ServeMux) {
	ms := newMemoryStore()
	cache := newCache()
	srv := &server{store: ms, cache: cache}
	mux := http.NewServeMux()
	mux.HandleFunc(basePath, func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("X-Tenant-ID") == "" { writeJSON(w, http.StatusBadRequest, map[string]string{"error": "missing X-Tenant-ID header"}); return }
		switch r.Method {
		case http.MethodGet: srv.handleList(w, r)
		case http.MethodPost: srv.handleCreate(w, r)
		}
	})
	mux.HandleFunc(basePath+"/", func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("X-Tenant-ID") == "" { writeJSON(w, http.StatusBadRequest, map[string]string{"error": "missing X-Tenant-ID header"}); return }
		id := r.URL.Path[len(basePath+"/"):]
		switch r.Method {
		case http.MethodGet: srv.handleGet(w, r, id)
		case http.MethodPut: srv.handleUpdate(w, r, id)
		case http.MethodDelete: srv.handleDelete(w, r, id)
		}
	})
	return srv, mux
}

func createEntity(t *testing.T, mux http.Handler, tenant string, payload map[string]any) map[string]any {
	t.Helper()
	body, _ := json.Marshal(payload)
	req := httptest.NewRequest(http.MethodPost, basePath, bytes.NewReader(body))
	req.Header.Set("X-Tenant-ID", tenant)
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)
	if w.Code != http.StatusCreated { t.Fatalf("expected 201, got %d: %s", w.Code, w.Body.String()) }
	var resp map[string]any
	_ = json.Unmarshal(w.Body.Bytes(), &resp)
	return resp
}

func TestCursorRoundTrip(t *testing.T) {
	_, mux := setupTestServer()
	tenant := "tenant-cursor-test"
	for i := 0; i < 5; i++ {
		createEntity(t, mux, tenant, map[string]any{"session_id": "s1", "runtime": "python"})
	}
	req := httptest.NewRequest(http.MethodGet, basePath+"?limit=2", nil)
	req.Header.Set("X-Tenant-ID", tenant)
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)
	var page1 map[string]any
	_ = json.Unmarshal(w.Body.Bytes(), &page1)
	items1 := page1["items"].([]any)
	if len(items1) != 2 { t.Fatalf("expected 2, got %d", len(items1)) }
	nextCursor := page1["next_cursor"].(string)
	if nextCursor == "" { t.Fatal("expected non-empty next_cursor") }
	req2 := httptest.NewRequest(http.MethodGet, basePath+"?limit=2&cursor="+nextCursor, nil)
	req2.Header.Set("X-Tenant-ID", tenant)
	w2 := httptest.NewRecorder()
	mux.ServeHTTP(w2, req2)
	var page2 map[string]any
	_ = json.Unmarshal(w2.Body.Bytes(), &page2)
	items2 := page2["items"].([]any)
	if len(items2) != 2 { t.Fatalf("expected 2, got %d", len(items2)) }
	if items1[1].(map[string]any)["id"] == items2[0].(map[string]any)["id"] { t.Fatal("pages should not overlap") }
}

func TestMemoryListInvalidatesCache(t *testing.T) {
	srv, mux := setupTestServer()
	tenant := "tenant-cache-test"
	createEntity(t, mux, tenant, map[string]any{"session_id": "s1", "runtime": "go"})
	req := httptest.NewRequest(http.MethodGet, basePath+"?limit=10", nil)
	req.Header.Set("X-Tenant-ID", tenant)
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)
	var list1 map[string]any
	_ = json.Unmarshal(w.Body.Bytes(), &list1)
	if int(list1["count"].(float64)) != 1 { t.Fatalf("expected 1") }
	cacheKey := "list:" + tenant + "::10:map[]"
	if _, ok := srv.cache.get(cacheKey); !ok { t.Fatal("expected cache entry") }
	createEntity(t, mux, tenant, map[string]any{"session_id": "s2", "runtime": "node"})
	if _, ok := srv.cache.get(cacheKey); ok { t.Fatal("expected cache invalidated") }
	req2 := httptest.NewRequest(http.MethodGet, basePath+"?limit=10", nil)
	req2.Header.Set("X-Tenant-ID", tenant)
	w2 := httptest.NewRecorder()
	mux.ServeHTTP(w2, req2)
	var list2 map[string]any
	_ = json.Unmarshal(w2.Body.Bytes(), &list2)
	if int(list2["count"].(float64)) != 2 { t.Fatalf("expected 2") }
}

func TestUpdateAndDelete(t *testing.T) {
	_, mux := setupTestServer()
	resp := createEntity(t, mux, "t1", map[string]any{"session_id": "s1", "runtime": "docker"})
	id := resp["item"].(map[string]any)["id"].(string)
	body, _ := json.Marshal(map[string]any{"status": "running"})
	req := httptest.NewRequest(http.MethodPut, basePath+"/"+id, bytes.NewReader(body))
	req.Header.Set("X-Tenant-ID", "t1")
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)
	if w.Code != http.StatusOK { t.Fatalf("expected 200, got %d", w.Code) }
	req2 := httptest.NewRequest(http.MethodDelete, basePath+"/"+id, nil)
	req2.Header.Set("X-Tenant-ID", "t1")
	w2 := httptest.NewRecorder()
	mux.ServeHTTP(w2, req2)
	if w2.Code != http.StatusOK { t.Fatalf("expected 200, got %d", w2.Code) }
	req3 := httptest.NewRequest(http.MethodGet, basePath+"/"+id, nil)
	req3.Header.Set("X-Tenant-ID", "t1")
	w3 := httptest.NewRecorder()
	mux.ServeHTTP(w3, req3)
	if w3.Code != http.StatusNotFound { t.Fatalf("expected 404, got %d", w3.Code) }
}
