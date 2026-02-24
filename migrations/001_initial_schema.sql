-- ERP-Autonomous-Coding Initial Schema
-- Generated: 2026-02-24

-- Agent Core: Coding Sessions
CREATE TABLE IF NOT EXISTS coding_sessions (
	id TEXT PRIMARY KEY,
	tenant_id TEXT NOT NULL,
	user_id TEXT NOT NULL,
	project_id TEXT,
	task_description TEXT NOT NULL,
	language TEXT,
	files_modified_json TEXT,
	model_used TEXT,
	total_tokens INT DEFAULT 0,
	lines_added INT DEFAULT 0,
	lines_removed INT DEFAULT 0,
	test_results_json TEXT,
	status TEXT CHECK (status IN ('planning','coding','reviewing','testing','completed','failed','cancelled')) DEFAULT 'planning',
	started_at TIMESTAMPTZ,
	completed_at TIMESTAMPTZ,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coding_sessions_tenant ON coding_sessions (tenant_id);
CREATE INDEX IF NOT EXISTS idx_coding_sessions_user ON coding_sessions (tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_coding_sessions_status ON coding_sessions (tenant_id, status);

-- Review Engine: Code Reviews
CREATE TABLE IF NOT EXISTS coding_reviews (
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

CREATE INDEX IF NOT EXISTS idx_coding_reviews_tenant ON coding_reviews (tenant_id);
CREATE INDEX IF NOT EXISTS idx_coding_reviews_repo ON coding_reviews (tenant_id, repository_id);
CREATE INDEX IF NOT EXISTS idx_coding_reviews_status ON coding_reviews (tenant_id, status);

-- Task Planner: Coding Plans
CREATE TABLE IF NOT EXISTS coding_plans (
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

CREATE INDEX IF NOT EXISTS idx_coding_plans_tenant ON coding_plans (tenant_id);
CREATE INDEX IF NOT EXISTS idx_coding_plans_user ON coding_plans (tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_coding_plans_status ON coding_plans (tenant_id, status);

-- Git Bridge: Repositories
CREATE TABLE IF NOT EXISTS coding_repositories (
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

CREATE INDEX IF NOT EXISTS idx_coding_repositories_tenant ON coding_repositories (tenant_id);
CREATE INDEX IF NOT EXISTS idx_coding_repositories_provider ON coding_repositories (tenant_id, provider);
CREATE INDEX IF NOT EXISTS idx_coding_repositories_status ON coding_repositories (tenant_id, status);

-- Sandbox Runtime: Sandboxes
CREATE TABLE IF NOT EXISTS coding_sandboxes (
	id TEXT PRIMARY KEY,
	tenant_id TEXT NOT NULL,
	session_id TEXT NOT NULL,
	runtime TEXT CHECK (runtime IN ('node','python','go','rust','java','dotnet','ruby','docker')) NOT NULL,
	image TEXT,
	cpu_limit TEXT DEFAULT '1',
	memory_limit TEXT DEFAULT '512Mi',
	timeout_seconds INT DEFAULT 300,
	environment_json TEXT,
	volumes_json TEXT,
	status TEXT CHECK (status IN ('creating','running','stopped','terminated','error')) DEFAULT 'creating',
	exit_code INT,
	output TEXT,
	started_at TIMESTAMPTZ,
	stopped_at TIMESTAMPTZ,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coding_sandboxes_tenant ON coding_sandboxes (tenant_id);
CREATE INDEX IF NOT EXISTS idx_coding_sandboxes_runtime ON coding_sandboxes (tenant_id, runtime);
CREATE INDEX IF NOT EXISTS idx_coding_sandboxes_status ON coding_sandboxes (tenant_id, status);
