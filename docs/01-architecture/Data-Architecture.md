# Data Architecture -- Sovereign Code

**Module:** ERP-Autonomous-Coding | **Port:** 5182 | **Version:** 3.0 | **Date:** 2026-03-03

---

## 1. Core Tables

### 1.1 Repositories

```sql
CREATE TABLE repositories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    provider TEXT NOT NULL, -- github, gitlab, bitbucket
    clone_url TEXT NOT NULL,
    default_branch TEXT DEFAULT 'main',
    primary_language TEXT,
    languages JSONB DEFAULT '{}',
    total_files INTEGER,
    total_lines INTEGER,
    last_indexed_at TIMESTAMPTZ,
    index_status TEXT DEFAULT 'pending',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 1.2 Code Analyses

```sql
CREATE TABLE code_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    repository_id UUID NOT NULL REFERENCES repositories(id),
    analysis_type TEXT NOT NULL, -- complexity, coverage, debt, security, architecture
    scope TEXT,
    results JSONB NOT NULL,
    score FLOAT,
    previous_score FLOAT,
    triggered_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 1.3 Reviews and Suggestions

```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    repository_id UUID NOT NULL REFERENCES repositories(id),
    pr_number INTEGER NOT NULL,
    pr_title TEXT,
    pr_author TEXT,
    diff_size INTEGER,
    files_changed INTEGER,
    review_status TEXT NOT NULL DEFAULT 'pending',
    overall_score INTEGER,
    risk_level TEXT,
    summary TEXT,
    categories JSONB,
    review_time_ms INTEGER,
    model_used TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    review_id UUID NOT NULL REFERENCES reviews(id),
    file_path TEXT NOT NULL,
    line_start INTEGER NOT NULL,
    line_end INTEGER,
    category TEXT NOT NULL,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    suggested_fix TEXT,
    confidence FLOAT,
    status TEXT DEFAULT 'pending',
    accepted_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 1.4 Generated Tests

```sql
CREATE TABLE tests_generated (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    repository_id UUID NOT NULL REFERENCES repositories(id),
    target_file TEXT NOT NULL,
    target_function TEXT,
    test_file_path TEXT NOT NULL,
    test_content TEXT NOT NULL,
    test_framework TEXT NOT NULL,
    test_count INTEGER,
    passing_count INTEGER,
    coverage_achieved FLOAT,
    execution_time_ms INTEGER,
    status TEXT DEFAULT 'generated',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 1.5 Vulnerabilities

```sql
CREATE TABLE vulnerabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    repository_id UUID NOT NULL REFERENCES repositories(id),
    scan_type TEXT NOT NULL,
    file_path TEXT,
    line_number INTEGER,
    vulnerability_id TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL,
    cwe_id TEXT,
    owasp_category TEXT,
    suggested_fix TEXT,
    status TEXT DEFAULT 'open',
    fixed_in_commit TEXT,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);
```

### 1.6 Technical Debt

```sql
CREATE TABLE tech_debt_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    repository_id UUID NOT NULL REFERENCES repositories(id),
    category TEXT NOT NULL,
    file_path TEXT,
    function_name TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    debt_score FLOAT NOT NULL,
    estimated_effort_hours FLOAT,
    priority TEXT,
    auto_fixable BOOLEAN DEFAULT false,
    fix_pr_url TEXT,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);
```

### 1.7 Architecture Rules

```sql
CREATE TABLE architecture_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    repository_id UUID REFERENCES repositories(id),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    rule_type TEXT NOT NULL,
    rule_definition JSONB NOT NULL,
    severity TEXT DEFAULT 'high',
    is_active BOOLEAN DEFAULT true,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## 2. Knowledge Graph (Neo4j)

```
(:Repository)-[:CONTAINS]->(:File)-[:DEFINES]->(:Function)
(:Function)-[:CALLS]->(:Function)
(:Class)-[:IMPLEMENTS]->(:Interface)
(:Class)-[:EXTENDS]->(:Class)
(:Test)-[:TESTS]->(:Function)
(:APIEndpoint)-[:HANDLED_BY]->(:Function)
(:Repository)-[:DEPENDS_ON]->(:Dependency)
(:File)-[:IMPORTS]->(:File)
```

## 3. Code Embeddings (pgvector)

```sql
CREATE TABLE code_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    repository_id UUID NOT NULL,
    file_path TEXT NOT NULL,
    symbol_name TEXT,
    symbol_type TEXT,
    content TEXT NOT NULL,
    embedding vector(768),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_code_embedding ON code_embeddings
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

## 4. Data Security

- Customer code processed in-memory only; never persisted on Sovereign servers
- On-prem deployment stores all data within customer infrastructure
- Per-tenant encryption keys (AWS KMS)
- Row-level security on all tables via tenant_id
- Code snippets sent to LLM are ephemeral; no provider training

---

*Confidential. Sovereign Code. All rights reserved.*
