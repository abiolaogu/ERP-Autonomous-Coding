package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"sync/atomic"
	"time"
)

type capabilityDoc struct {
	Module          string   `json:"module"`
	Version         string   `json:"version,omitempty"`
	Capabilities    []string `json:"capabilities"`
	IntegrationMode string   `json:"integration_mode,omitempty"`
	AIDDGovernance  string   `json:"aidd_governance,omitempty"`
}

type taskRunRequest struct {
	Task         string `json:"task"`
	Repository   string `json:"repository"`
	Provider     string `json:"provider"`
	Priority     string `json:"priority"`
	RequireHuman bool   `json:"require_human_approval"`
}

var reqCounter uint64

func loadCapabilities() capabilityDoc {
	b, err := os.ReadFile("configs/capabilities.json")
	if err != nil {
		return capabilityDoc{Module: "ERP-Autonomous-Coding", Capabilities: []string{"unconfigured"}}
	}
	var d capabilityDoc
	if err := json.Unmarshal(b, &d); err != nil {
		return capabilityDoc{Module: "ERP-Autonomous-Coding", Capabilities: []string{"invalid_config"}}
	}
	if d.Module == "" {
		d.Module = "ERP-Autonomous-Coding"
	}
	return d
}

func writeJSON(w http.ResponseWriter, code int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(payload)
}

func decodeJSON(r *http.Request, dst any) error {
	decoder := json.NewDecoder(io.LimitReader(r.Body, 1<<20))
	decoder.DisallowUnknownFields()
	return decoder.Decode(dst)
}

func nextRequestID(r *http.Request) string {
	if id := r.Header.Get("X-Request-ID"); id != "" {
		return id
	}
	n := atomic.AddUint64(&reqCounter, 1)
	return fmt.Sprintf("req-%d-%d", time.Now().UnixNano(), n)
}

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (s *statusRecorder) WriteHeader(status int) {
	s.status = status
	s.ResponseWriter.WriteHeader(status)
}

func withServerDefaults(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		requestID := nextRequestID(r)
		w.Header().Set("X-Request-ID", requestID)
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Referrer-Policy", "no-referrer")
		w.Header().Set("Cache-Control", "no-store")

		rec := &statusRecorder{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(rec, r)

		tenant := r.Header.Get("X-Tenant-ID")
		if tenant == "" {
			tenant = "system"
		}
		log.Printf("method=%s path=%s status=%d duration_ms=%d tenant=%s request_id=%s remote=%s",
			r.Method,
			r.URL.Path,
			rec.status,
			time.Since(start).Milliseconds(),
			tenant,
			requestID,
			r.RemoteAddr,
		)
	})
}

func main() {
	doc := loadCapabilities()
	mux := http.NewServeMux()

	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}
		writeJSON(w, http.StatusOK, map[string]string{"status": "healthy", "module": "ERP-Autonomous-Coding"})
	})

	mux.HandleFunc("/v1/capabilities", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}
		writeJSON(w, http.StatusOK, doc)
	})

	mux.HandleFunc("/v1/tasks/run", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}
		tenantID := r.Header.Get("X-Tenant-ID")
		if tenantID == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "missing X-Tenant-ID"})
			return
		}
		auth := r.Header.Get("Authorization")
		if len(auth) < 20 {
			writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "missing/invalid bearer token"})
			return
		}
		var req taskRunRequest
		if err := decodeJSON(r, &req); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json payload"})
			return
		}
		if req.Task == "" || req.Repository == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "task and repository are required"})
			return
		}
		writeJSON(w, http.StatusAccepted, map[string]any{
			"status":                 "queued",
			"message":                "coding task enqueued",
			"tenant":                 tenantID,
			"task":                   req.Task,
			"repository":             req.Repository,
			"provider":               req.Provider,
			"priority":               req.Priority,
			"require_human_approval": req.RequireHuman,
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8090"
	}
	addr := ":" + port

	srv := &http.Server{
		Addr:              addr,
		Handler:           withServerDefaults(mux),
		ReadHeaderTimeout: 2 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       120 * time.Second,
		MaxHeaderBytes:    1 << 20,
	}

	log.Printf("ERP-Autonomous-Coding listening on %s", addr)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}
