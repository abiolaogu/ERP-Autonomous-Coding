# Product Deep Dive -- Sovereign Dev

**Module:** ERP-Autonomous-Coding | **Port:** 5182 | **Version:** 2.0 | **Date:** 2026-03-03

---

## 1. Product Architecture

Sovereign Dev is built on a single foundational innovation: the **Code Knowledge Graph (CKG)** -- a rich, queryable representation of an entire codebase that powers every AI capability.

```
                        ┌──────────────────────────────────┐
                        │       Developer Interfaces        │
                        │  Web Dashboard │ IDE Plugin │ API  │
                        └──────────┬───────────────────────┘
                                   │
                        ┌──────────▼───────────────────────┐
                        │        AI Capability Layer        │
                        │  Code Gen │ Review │ Test Gen     │
                        │  Security │ Debt │ Search │ CI/CD │
                        └──────────┬───────────────────────┘
                                   │
                        ┌──────────▼───────────────────────┐
                        │     Code Knowledge Graph (CKG)    │
                        │  AST Nodes │ Dependency Edges     │
                        │  Embeddings │ Conventions │ Git   │
                        └──────────┬───────────────────────┘
                                   │
                        ┌──────────▼───────────────────────┐
                        │      Infrastructure Layer         │
                        │  Self-Hosted LLM │ PostgreSQL     │
                        │  pgvector │ Kafka │ Redis         │
                        └──────────────────────────────────┘
```

---

## 2. Core Innovation: Code Knowledge Graph

### What It Is
The CKG is a comprehensive graph database representing every entity in a codebase and their relationships:

- **Nodes:** Functions, classes, methods, files, modules, tests, dependencies
- **Edges:** Calls, imports, inherits, implements, tests, modifies
- **Attributes:** Complexity, coverage, embedding vectors, conventions, git history

### How It's Built
1. **Repository Ingestion** -- Clone/pull via Git, incremental updates on every push
2. **Multi-Language AST Parsing** -- Tree-sitter parsers for Go, Python, TypeScript, Java, Rust, SQL
3. **Dependency Graph Construction** -- Resolve every function call to its target across files and modules
4. **Convention Extraction** -- Analyze naming patterns, error handling, logging, test frameworks
5. **Code Embedding** -- Generate semantic vectors (768-dim) for every function using CodeBERT
6. **Indexing** -- Graph queries via Apache AGE, vector search via pgvector, full-text via tsvector

### Why It Matters
Every competitor operates at the file level. Sovereign Dev operates at the **codebase level**:

| Capability | File-Level AI | **CKG-Level AI** |
|---|---|---|
| Generate code | Completes current file | Generates across multiple files, respecting architecture |
| Review PR | Checks changed lines | Checks impact on callers, callees, tests |
| Find bugs | Pattern matching | Data flow analysis across call chains |
| Security scan | Regex + patterns | Traces user input through sanitization to sink |
| Test generation | Template-based | Context-aware with dependency mocking |

---

## 3. Product Capabilities

### 3.1 AI Code Generation

**Input:** Natural language description ("Add payment retry logic with exponential backoff")

**Process:**
1. Query CKG for relevant context: existing payment code, error handling patterns, retry conventions
2. Identify affected files: handler, service, repository, migration, test
3. Generate all files coherently with consistent types, interfaces, and error handling
4. Validate: syntax, type checking, linting, convention compliance

**Output:** Multi-file PR with all changes, ready for human review

**Quality metrics:**
- Convention compliance: 94% match with existing codebase patterns
- Type safety: 100% (generated code passes type checker)
- First-attempt acceptance: 72% (developers accept without modification)
- Generation latency: <5s single-file, <15s multi-file

### 3.2 Automated Code Review

**Input:** Pull request diff (webhook from GitHub/GitLab)

**Process:**
1. Parse diff into file-level hunks with line-level changes
2. Enrich context from CKG: load changed functions + callers + callees + tests + types
3. Run 5 parallel analysis engines:
   - **Style:** Convention compliance, naming, formatting
   - **Bug Detection:** Null dereference, race conditions, resource leaks, boundary errors
   - **Security:** SQL injection, XSS, command injection, secret detection
   - **Performance:** N+1 queries, unnecessary allocations, unbounded operations
   - **Architecture:** Layer violations, pattern compliance, import rules
4. Aggregate, deduplicate, and rank findings by severity
5. Generate specific code fixes for each finding
6. Post inline comments on PR with severity badges

**Output:** Line-level review comments with explanations, severity, and one-click fix suggestions

**Quality metrics:**
- Review completion: <10 minutes from PR opened
- Finding accuracy: 91% true positive rate
- Fix acceptance: 78% of suggested fixes applied without modification
- Coverage: 5 analysis dimensions vs. single-dimension point tools

### 3.3 Test Generation

**Input:** Function selected for testing (from CKG)

**Process:**
1. Analyze function: signature, body, dependencies, side effects, I/O operations
2. Generate test scenarios: happy path, boundaries, errors, combinations
3. Generate mock/stub implementations for external dependencies
4. Generate test code using existing test patterns from CKG
5. Validate quality:
   - Syntax and compilation check
   - Execute tests against actual code
   - **Mutation testing:** Introduce systematic mutations, verify tests catch them

**Output:** Test file with validated test cases and mutation testing report

**Quality gate:** >90% mutation score required. Tests that only execute code without catching bugs are rejected.

**Quality metrics:**
- Average mutation score: 94% (vs. industry standard of ~60%)
- Coverage improvement: +42% average per function
- Test execution: all generated tests run and pass
- Generation latency: <30 seconds per function

### 3.4 Security Scanning

**Input:** Repository code + PR changes

**Process:**
1. **SAST:** Pattern-based + data flow analysis for injection, XSS, command injection, path traversal
2. **SCA:** Dependency vulnerability scanning against NVD, OSV, GitHub Advisory databases
3. **Secret Detection:** API keys, tokens, passwords in code and git history
4. **AI False Positive Reduction:**
   - For each SAST finding, load full context from CKG
   - LLM evaluates: Is input sanitized? Are framework protections active? Is the ORM preventing injection?
   - Confidence scoring: >=0.8 true positive, >=0.8 not vulnerable = suppress, <0.8 = human review

**Output:** Prioritized findings with confidence scores, AI explanations, and remediation PRs

**Quality metrics:**
- False positive rate: <10% (down from industry average of 73%)
- Vulnerability coverage: OWASP Top 10 + CWE Top 25
- Remediation: Auto-generated fix PRs for confirmed vulnerabilities
- Scan time: <5 minutes for full PR diff

### 3.5 Technical Debt Tracking

**Input:** Repository codebase (daily analysis)

**Process:**
1. Calculate per-module scores across 6 dimensions:
   - Complexity (cyclomatic complexity / threshold, weight 0.20)
   - Duplication (semantic similarity, not just text matching, weight 0.15)
   - Test coverage (branch coverage, weight 0.20)
   - Documentation currency (stale docs detection, weight 0.10)
   - Dependency health (outdated + vulnerable deps, weight 0.15)
   - Code smells (long methods, god classes, deep nesting, weight 0.20)
2. Composite score: 0-100 (lower is better)
3. Correlate with bug frequency and change velocity for prioritization
4. Track trends over time, alert on acceleration

**Output:** Module-level debt scores, treemap visualization, prioritized remediation list

**Quality metrics:**
- Score granularity: per-module, per-file, per-function
- Trend tracking: daily measurements, 13-month retention
- Prioritization: debt × change_frequency × bug_correlation
- Actionable: "Generate Refactoring PR" for top debt items

### 3.6 Semantic Code Search

**Input:** Natural language query ("find where we handle payment retries")

**Process:**
1. Generate query embedding using same CodeBERT model as CKG
2. Vector similarity search across all function embeddings (pgvector HNSW)
3. Re-rank results using cross-encoder model for precision
4. Enrich results with CKG context: callers, tests, complexity, recent changes

**Output:** Ranked code snippets with relevance scores, dependency graphs, and action links

**Quality metrics:**
- Search latency: <2 seconds
- Relevance: 87% of top-5 results rated "relevant" by developers
- Scale: Supports repositories up to 10M lines of code

---

## 4. Integration Architecture

### 4.1 Git Provider Integration
- **GitHub:** REST API v3 + GraphQL v4 + Webhooks (PR events, push events)
- **GitLab:** REST API v4 + Webhooks
- **Bitbucket:** REST API v2 + Webhooks
- Event-driven: Kafka consumers process webhook events for real-time response

### 4.2 IDE Integration (Phase 4)
- **VS Code Extension:** Inline code generation, real-time security warnings
- **JetBrains Plugin:** Same capabilities via Language Server Protocol

### 4.3 CI/CD Integration
- GitHub Actions, GitLab CI, Jenkins, CircleCI, Azure DevOps
- Build failure prediction, flaky test detection, pipeline optimization

### 4.4 API Access
- Hasura GraphQL federation for all data queries
- REST webhooks for event notifications
- gRPC for high-throughput internal communication

---

## 5. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Backend services | Go 1.22+ | Performance, concurrency, strong typing |
| LLM inference | vLLM (self-hosted) | Privacy, cost control, model flexibility |
| Code parsing | Tree-sitter | Multi-language, fast, incremental parsing |
| Primary database | PostgreSQL 16 | ACID, mature, extensible |
| Vector store | pgvector | Integrated with PostgreSQL, HNSW indexes |
| Graph queries | Apache AGE | Cypher queries on PostgreSQL |
| Event streaming | Apache Kafka | Reliable event processing at scale |
| Cache | Redis Cluster | Sub-millisecond lookups for CKG metadata |
| API gateway | Hasura | Instant GraphQL API, row-level security |
| Frontend | React + Vite + Refine.dev | Modern, performant, component library |

---

## 6. Product Roadmap

### Phase 1: Foundation (Months 1-3) -- COMPLETE
- Single-file code generation with CKG context
- Automated PR review (style, bugs, basic security)
- Semantic code search

### Phase 2: Quality (Months 4-6) -- IN PROGRESS
- Multi-file code generation
- Test generation with mutation testing validation
- SAST with AI false positive reduction
- SCA dependency scanning
- Auto-documentation

### Phase 3: Intelligence (Months 7-9)
- Architecture consistency checking
- Technical debt scoring and trending
- Refactoring assistant
- CI/CD intelligence (failure prediction, flaky test detection)
- DORA metrics dashboard

### Phase 4: Platform (Months 10-12)
- Integration test generation
- Architecture diagrams from code
- IDE plugins (VS Code, JetBrains)
- Advanced developer analytics
- Pipeline optimization suggestions

---

*Document Control: Product roadmap reviewed quarterly with Engineering and Product leadership.*
