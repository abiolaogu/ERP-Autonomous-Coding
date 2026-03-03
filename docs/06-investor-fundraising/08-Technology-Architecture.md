# Sovereign Code -- Technology Architecture

**Confidential | Series A | March 2026**

---

## 1. System Overview

Cloud-native, event-driven platform optimized for low-latency code intelligence. Key design constraint: customer code privacy (never persisted on our servers in cloud mode).

## 2. Core Services

### Code LLM Gateway
Multi-model routing: line completions via self-hosted Code Llama 34B (<200ms) or Claude Haiku; complex tasks via Claude 3.5 Sonnet. Prompt assembly includes current file, import graph, codebase semantic search results, and team style rules.

### Codebase Indexer
tree-sitter-based multi-language AST parsing. Extracts symbols, relationships, and metadata. Builds Neo4j knowledge graph and pgvector embeddings. Full index: <15 min for 1M LOC. Incremental: <30s per push.

### Analysis Engine
Three-pass PR review: (1) pattern matching (AST rules), (2) LLM analysis (bugs, performance, architecture), (3) security scan (SAST + CVE + secrets). Test generator: AST analysis → case planning → code generation → sandbox execution → coverage measurement.

### Security Scanner
SAST via AST pattern matching + LLM reasoning. Dependency scanning against NVD + GitHub Advisory databases (hourly refresh). Secrets detection: regex + entropy + ML classifier. OWASP Top 10 detection >95%.

## 3. Knowledge Graph (Neo4j)

450K+ nodes across current deployments: functions, classes, interfaces, API endpoints, tests, dependencies. 3.2M+ edges: calls, imports, implements, extends, tests, depends_on. Query latency: <50ms for 3-hop traversal. Powers: semantic search, impact analysis, architecture visualization, context assembly for LLM prompts.

## 4. Data Architecture

| Store | Technology | Data |
|---|---|---|
| Operational | PostgreSQL 16 | Repos, reviews, suggestions, vulns, debt |
| Knowledge Graph | Neo4j 5.x | Codebase structure and relationships |
| Vector Index | pgvector | Code embeddings (768 dims) |
| Cache | Redis 7 | Completion cache, session, rate limits |
| Object Store | S3 | Generated tests, documents, reports |
| Event Bus | Redpanda | Webhooks, analysis triggers, notifications |

## 5. Security

- **Code privacy:** Cloud mode processes code in-memory; never persisted. On-prem mode stores everything locally.
- **LLM data:** Ephemeral processing; no provider training on customer code. Contractual guarantees.
- **Auth:** OAuth 2.0 with GitHub/GitLab SSO. API keys for CI/CD.
- **Encryption:** TLS 1.3 in transit, AES-256 at rest, per-tenant KMS keys.
- **Compliance:** SOC 2 Type I (complete), Type II (Q4 2026), ISO 27001 (Q1 2027).

## 6. Deployment Options

| Mode | Architecture | Customer |
|---|---|---|
| Cloud SaaS | Multi-tenant, managed | Startups, mid-market |
| Hybrid | Cloud control + on-prem inference | Enterprise |
| On-Premises | Fully self-hosted, air-gapped | Government, defense, regulated |

## 7. Stack Summary

| Layer | Technology |
|---|---|
| Backend | Go 1.22, Python 3.12 |
| Frontend | React 18, Vite, Monaco Editor, D3.js |
| IDE | VS Code Extension API, JetBrains Plugin SDK |
| Code LLM | Claude 3.5 Sonnet (cloud), Code Llama 34B (self-hosted) |
| Parsing | tree-sitter (15 languages) |
| Graph | Neo4j 5.x |
| Vector | pgvector |
| Database | PostgreSQL 16 |
| CI/CD | GitHub Actions, ArgoCD |
| Infra | Kubernetes (EKS), Terraform |

## 8. Technical Moats

| Moat | Time to Replicate |
|---|---|
| Knowledge graph (Neo4j, 450K nodes) | 12-18 months |
| Multi-language AST pipeline (15 languages) | 12 months |
| Full-lifecycle integration (completion + review + test + security + debt) | 18-24 months |
| ERP-native integration (API schemas, data models, business rules) | 18-24 months |
| On-premises deployment with self-hosted LLM | 6-12 months |

---

*Confidential. Sovereign Code, Inc.*
