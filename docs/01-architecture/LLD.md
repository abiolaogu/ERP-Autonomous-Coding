# Low-Level Design (LLD) -- Sovereign Code

**Module:** ERP-Autonomous-Coding | **Port:** 5182 | **Version:** 3.0 | **Date:** 2026-03-03

---

## 1. Code Generation Pipeline

```
Developer types in IDE
    │
    ▼
┌─────────────────────────────┐
│ 1. CONTEXT GATHERING         │
│  ├─ Current file content    │
│  ├─ Cursor position + prefix│
│  ├─ Open editor tabs        │
│  ├─ Import graph (3 hops)   │
│  ├─ Codebase semantic search│ ← pgvector: find relevant code snippets
│  └─ Team style rules        │ ← Architecture rules from DB
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ 2. PROMPT CONSTRUCTION       │
│  ├─ System: "You are a code │
│  │   assistant for [lang]"  │
│  ├─ Context: related code   │
│  ├─ Prefix: code before     │
│  │   cursor                 │
│  ├─ Suffix: code after      │
│  │   cursor (FIM)           │
│  └─ Instructions: style     │
│      rules, patterns        │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ 3. LLM INFERENCE             │
│  ├─ Model selection:        │
│  │   Line → Haiku/CodeLlama │
│  │   Multi-line → Sonnet    │
│  │   Multi-file → Sonnet    │
│  ├─ Streaming tokens        │
│  └─ <500ms for completions  │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ 4. POST-PROCESSING           │
│  ├─ Syntax validation       │ ← tree-sitter parse (syntax OK?)
│  ├─ Style check             │ ← Lint against team rules
│  ├─ Security scan           │ ← Check for secrets, vulns
│  ├─ Deduplication           │ ← Avoid suggesting existing code
│  └─ Confidence scoring      │ ← Rank multiple completions
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ 5. DELIVERY                  │
│  ├─ Ghost text in IDE       │ ← Gray text overlay
│  ├─ Tab to accept           │
│  ├─ Esc to dismiss          │
│  └─ Log: accepted/rejected  │
└─────────────────────────────┘
```

## 2. Code Review Pipeline

```
PR Created (Webhook from GitHub/GitLab)
    │
    ▼
┌─────────────────────────────┐
│ 1. DIFF PARSING              │
│  ├─ Fetch PR diff via API   │
│  ├─ Parse into structured   │
│  │   changeset per file     │
│  ├─ Classify: new/modified/ │
│  │   deleted/renamed        │
│  └─ Calculate diff size     │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ 2. CONTEXT ENRICHMENT        │
│  ├─ Full file content for   │
│  │   each changed file      │
│  ├─ Knowledge graph: what   │
│  │   calls changed functions│
│  ├─ Architecture rules for  │
│  │   affected layers        │
│  ├─ Test coverage data for  │
│  │   changed code           │
│  └─ Historical PR patterns  │
│      for similar changes    │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ 3. MULTI-PASS ANALYSIS       │
│                              │
│  Pass 1: Pattern Matching    │
│  ├─ SAST rules (regex + AST)│
│  ├─ Anti-pattern detection   │
│  └─ Style rule violations    │
│                              │
│  Pass 2: LLM Analysis        │
│  ├─ Bug detection            │
│  ├─ Performance analysis     │
│  ├─ Architecture compliance  │
│  ├─ Best practices review    │
│  └─ Generate inline comments │
│                              │
│  Pass 3: Security Scan       │
│  ├─ OWASP vulnerability check│
│  ├─ Secrets detection        │
│  ├─ Dependency CVE check     │
│  └─ Config security review   │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ 4. REVIEW GENERATION         │
│  ├─ PR Summary: what changed│
│  │   why, impact assessment  │
│  ├─ Risk Level: low/med/high│
│  ├─ Inline comments with    │
│  │   suggested fixes (diffs)│
│  ├─ Overall score (0-100)   │
│  └─ Post review via API     │
│      (GitHub/GitLab comments)│
└─────────────────────────────┘
```

## 3. Test Generation Pipeline

```
Target Code Selection (file or function)
    │
    ▼
┌─────────────────────────────┐
│ 1. CODE ANALYSIS             │
│  ├─ Parse AST                │
│  ├─ Extract function sigs    │
│  ├─ Identify input types     │
│  ├─ Identify return types    │
│  ├─ Find error conditions    │
│  └─ Detect dependencies      │
│      (mocks needed)          │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ 2. TEST CASE PLANNING        │
│  ├─ Happy path scenarios    │
│  ├─ Edge cases (null, empty │
│  │   max, min, boundary)     │
│  ├─ Error handling paths    │
│  ├─ Concurrency scenarios   │
│  └─ Look at existing tests  │
│      for patterns            │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ 3. CODE GENERATION           │
│  ├─ Select test framework   │
│  ├─ Generate mock/stub code │
│  ├─ Generate test functions  │
│  ├─ Generate assertions     │
│  └─ Generate test data      │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ 4. VALIDATION                │
│  ├─ Execute tests in sandbox│
│  ├─ Measure coverage        │
│  ├─ Fix failing tests       │
│  │   (up to 3 iterations)   │
│  └─ Report results          │
└─────────────────────────────┘
```

## 4. Codebase Indexing Pipeline

```
Git Push / Webhook
    │
    ▼
┌─────────────────────────────┐
│ 1. INCREMENTAL DIFF          │
│  ├─ git diff HEAD~1..HEAD   │
│  ├─ Identify changed files  │
│  └─ Queue for processing    │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ 2. AST PARSING               │
│  ├─ tree-sitter parse each  │
│  │   changed file            │
│  ├─ Extract symbols:        │
│  │   functions, classes,     │
│  │   types, imports          │
│  └─ <50ms per file          │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ 3. GRAPH UPDATE              │
│  ├─ Upsert nodes in Neo4j   │
│  ├─ Update relationships    │
│  │   (calls, imports,       │
│  │   implements)             │
│  ├─ Remove deleted symbols  │
│  └─ <5s for incremental     │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ 4. EMBEDDING UPDATE          │
│  ├─ Generate embeddings for │
│  │   changed symbols         │
│  ├─ Upsert in pgvector      │
│  └─ <10s for incremental    │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ 5. TRIGGER ANALYSES          │
│  ├─ Security scan on changed│
│  │   files                   │
│  ├─ Debt score recalculation│
│  └─ Architecture check      │
└─────────────────────────────┘
```

## 5. Performance Targets

| Operation | Target | Mechanism |
|---|---|---|
| Line completion | <200ms | Self-hosted model + caching |
| Multi-line completion | <500ms | Streaming from Claude Haiku |
| Multi-file generation | <30s | Claude Sonnet with full context |
| PR review | <90s | Parallel analysis passes |
| Test generation (100 functions) | <60s | Parallel per-function generation |
| Security scan (full repo) | <30s | Rule engine + parallel CVE lookup |
| Codebase index (incremental) | <30s | Delta processing only |
| Codebase index (full, 1M LOC) | <15min | Parallel parsing + batch embedding |
| Semantic code search | <100ms | pgvector IVFFlat index |
| Knowledge graph query | <50ms | Neo4j with cached frequent paths |

## 6. API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/completions` | POST | Code completion (IDE) |
| `/api/v1/generate` | POST | Multi-file code generation |
| `/api/v1/repositories` | CRUD | Repository management |
| `/api/v1/repositories/:id/index` | POST | Trigger re-index |
| `/api/v1/reviews` | GET/POST | Review management |
| `/api/v1/reviews/:id/suggestions` | GET | Get review suggestions |
| `/api/v1/tests/generate` | POST | Generate tests |
| `/api/v1/security/scan` | POST | Trigger security scan |
| `/api/v1/security/vulnerabilities` | GET | List vulnerabilities |
| `/api/v1/debt` | GET | Technical debt overview |
| `/api/v1/debt/items` | GET | Debt items list |
| `/api/v1/search` | POST | Semantic code search |
| `/api/v1/graph/query` | POST | Knowledge graph query |
| `/api/v1/docs/generate` | POST | Documentation generation |
| `/api/v1/architecture/rules` | CRUD | Architecture rules |
| `/api/v1/architecture/check` | POST | Run compliance check |
| `/api/v1/webhooks/github` | POST | GitHub webhook handler |
| `/api/v1/webhooks/gitlab` | POST | GitLab webhook handler |

---

*Confidential. Sovereign Code. All rights reserved.*
