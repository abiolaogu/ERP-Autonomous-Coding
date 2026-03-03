# Technical Architecture (Investor Overview) -- Sovereign Dev

**Module:** ERP-Autonomous-Coding | **Port:** 5182 | **Version:** 2.0 | **Date:** 2026-03-03

---

## 1. Architecture Philosophy

Sovereign Dev is built on three architectural principles that create compounding competitive advantage:

1. **Code Knowledge Graph first** -- Every AI capability queries the CKG, not raw source files
2. **Privacy by architecture** -- Self-hosted LLM inference; zero code leaves tenant boundary
3. **Event-driven & composable** -- Kafka-based event bus enables independent scaling and new capability development

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DEVELOPER INTERFACES                         │
│   Web Dashboard (React/Vite)  │  IDE Plugins  │  CLI  │  API       │
└─────────────────────┬───────────────────────────────────────────────┘
                      │ GraphQL (Hasura)
┌─────────────────────▼───────────────────────────────────────────────┐
│                        API GATEWAY (Hasura)                         │
│   Authentication │ Authorization │ Rate Limiting │ Row-Level Security│
└─────────────────────┬───────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────────┐
│                     AI CAPABILITY SERVICES (Go)                     │
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ Code Gen │ │ Review   │ │ Test Gen │ │ Security │ │ Tech Debt│ │
│  │ Engine   │ │ Engine   │ │ Engine   │ │ Scanner  │ │ Analyzer │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ │
│       │             │            │             │            │       │
│  ┌────┴─────┐ ┌────┴─────┐ ┌───┴──────┐                           │
│  │ Semantic │ │ CI/CD    │ │ Arch     │                            │
│  │ Search   │ │ Intel    │ │ Analyzer │                            │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘                           │
└───────┼─────────────┼────────────┼──────────────────────────────────┘
        │             │            │
┌───────▼─────────────▼────────────▼──────────────────────────────────┐
│                   CODE KNOWLEDGE GRAPH (CKG)                        │
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ Repo     │ │ AST      │ │ Dep Graph│ │ Convention│              │
│  │ Ingester │ │ Parser   │ │ Builder  │ │ Extractor │              │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘              │
│       │             │            │             │                    │
│  ┌────┴─────┐ ┌────┴─────┐ ┌───┴──────┐                           │
│  │ Code     │ │ Pattern  │ │ Graph    │                            │
│  │ Embedder │ │ Detector │ │ Indexer  │                            │
│  └──────────┘ └──────────┘ └──────────┘                            │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────────┐
│                      INFRASTRUCTURE LAYER                           │
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │PostgreSQL│ │ pgvector │ │ Redis    │ │ Kafka    │ │ vLLM     │ │
│  │ 16       │ │ (HNSW)   │ │ Cluster  │ │ Events   │ │ (GPU)    │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Components

### 3.1 Code Knowledge Graph (CKG) -- The Moat

**What it is:** A rich, queryable graph representation of an entire codebase.

**Graph structure:**
- **Nodes:** Repositories, files, functions, classes, modules, tests, dependencies
- **Edges:** Calls, imports, inherits, implements, tests, modifies
- **Attributes:** Complexity scores, coverage data, embedding vectors, conventions, git history

**Build pipeline:**
1. **Repository Ingestion** -- Git clone/pull, incremental on every push via webhook
2. **Multi-Language AST Parsing** -- Tree-sitter for Go, Python, TypeScript, Java, Rust, SQL
3. **Dependency Graph** -- Resolve every function call to its target across the codebase
4. **Convention Extraction** -- Analyze naming patterns, error handling, logging, testing frameworks
5. **Code Embedding** -- 768-dimensional vectors via CodeBERT for every function
6. **Indexing** -- Apache AGE for graph queries, pgvector for similarity search, tsvector for text search

**Performance:**
- Build time: <10 minutes for 1M LOC repository
- Incremental update: <30 seconds for typical PR
- Query latency: <100ms for graph traversals, <500ms for embedding search

**Why it matters for investors:** The CKG is 18+ months of dedicated engineering. It cannot be replicated by "adding an LLM" to an existing tool. It is the architectural foundation that makes every AI capability superior to point solutions.

### 3.2 Self-Hosted LLM Inference

**Architecture:**
- vLLM serving framework on GPU nodes (NVIDIA A100/H100)
- Model: fine-tuned CodeLlama or StarCoder2 (customer can bring their own model)
- Continuous batching for optimal GPU utilization
- Progressive quantization: FP16 for quality-critical tasks, INT8 for speed-critical tasks

**Cost model:**
- Cost per inference: $0.002 (amortized across multi-tenant GPU cluster)
- 50 inferences/developer/day average
- GPU cost per developer: $0.10/day = $3/month
- Scale: single A100 GPU serves ~200 concurrent developers

**Privacy guarantee:**
- Zero code transmitted to external APIs
- All LLM inference within tenant's network boundary
- Model weights stored within customer's infrastructure (enterprise tier)
- No training on customer code without explicit opt-in

### 3.3 Event-Driven Architecture

**Apache Kafka** processes all system events:

| Event | Source | Consumers | Volume |
|---|---|---|---|
| `pr.opened` | GitHub webhook | Review Engine, Security Scanner | ~50/day/repo |
| `pr.updated` | GitHub webhook | Review Engine (re-review) | ~100/day/repo |
| `push.received` | GitHub webhook | CKG Updater | ~200/day/repo |
| `review.completed` | Review Engine | Notification Router, Analytics | ~50/day/repo |
| `security.finding` | Security Scanner | Alert Manager, Jira Integration | ~20/day/repo |
| `test.generated` | Test Engine | Validation Runner, Analytics | ~10/day/repo |
| `ckg.updated` | CKG Updater | All AI Services (cache invalidation) | ~200/day/repo |

**Benefits:**
- Services scale independently (GPU-heavy LLM inference vs. CPU-bound parsing)
- New capabilities added by subscribing to existing events
- Replay capability for reprocessing and debugging
- Exactly-once processing guarantees

---

## 4. Data Architecture

### 4.1 PostgreSQL 16 -- Primary Data Store

**14 tables** modeling the full software development lifecycle:

| Table | Row Estimate (per repo) | Key Queries |
|---|---|---|
| `repositories` | 1 | Dashboard, settings |
| `files` | ~10,000 | CKG file tree, search |
| `functions` | ~100,000 | CKG node lookups, search |
| `function_calls` | ~500,000 | Dependency graph, impact analysis |
| `pull_requests` | ~5,000 | Review queue, history |
| `review_findings` | ~50,000 | Finding detail, severity filters |
| `test_generations` | ~2,000 | Test history, quality metrics |
| `security_findings` | ~10,000 | Security dashboard, compliance |
| `dependencies` | ~500 | SCA, vulnerability tracking |
| `tech_debt_scores` | ~1,000 | Debt dashboard, trends |
| `code_generations` | ~5,000 | Generation history, acceptance |
| `architecture_rules` | ~50 | Architecture compliance |
| `ci_builds` | ~10,000 | CI/CD intelligence |
| `developer_metrics` | ~3,000 | DORA metrics, analytics |

### 4.2 pgvector -- Code Embedding Search

- **Index type:** HNSW (Hierarchical Navigable Small World)
- **Vector dimension:** 768 (CodeBERT output)
- **Scale:** ~100K vectors per repository
- **Query performance:** <50ms for top-20 nearest neighbors
- **Use cases:** Semantic code search, duplicate detection, similar function finding

### 4.3 Redis Cluster -- Hot Data Cache

- CKG node metadata (function signatures, complexity scores)
- Active PR review state
- User session data
- Rate limiting counters
- Cache hit rate: >90% for CKG lookups

### 4.4 Multi-Tenancy

- Every table includes `tenant_id TEXT NOT NULL`
- Hasura row-level security enforces tenant isolation at the API layer
- Database-level: shared schema, logical isolation via tenant_id
- Network-level: VPC isolation for enterprise customers
- No cross-tenant data access possible at any layer

---

## 5. Security Architecture

### 5.1 Code Privacy Model

```
┌─────────────────────────────────────────┐
│              TENANT BOUNDARY            │
│                                         │
│  ┌─────┐   ┌─────┐   ┌──────┐         │
│  │ Git │──▶│ CKG │──▶│ LLM  │         │
│  │Repo │   │Build│   │Infer │         │
│  └─────┘   └─────┘   └──────┘         │
│      ▲                    │             │
│      │      ┌─────┐      │             │
│      └──────│ DB  │◀─────┘             │
│             └─────┘                    │
│                                         │
│  NOTHING LEAVES THIS BOUNDARY           │
└─────────────────────────────────────────┘
```

### 5.2 Authentication & Authorization
- OAuth 2.0 via ERP-Auth module
- GitHub/GitLab SSO integration
- RBAC: Developer, Tech Lead, Admin roles
- Repository-level permissions synced from Git provider
- API keys for CI/CD integration (scoped to specific repos)

### 5.3 Compliance
- **SOC2 Type II:** In progress (expected Q3 2026)
- **ISO 27001:** Planned (Q4 2026)
- **GDPR:** Compliant (EU data residency supported)
- **HIPAA:** Supported via self-hosted deployment
- **PCI-DSS:** Supported via VPC isolation

### 5.4 Encryption
- At rest: AES-256 (PostgreSQL TDE)
- In transit: TLS 1.3 (all internal and external communication)
- Git credentials: Encrypted in HashiCorp Vault
- Embedding vectors: Encrypted at rest alongside source data

---

## 6. Scalability

### 6.1 Current Capacity

| Component | Current Capacity | Scaling Mechanism |
|---|---|---|
| CKG builds | 50 repos concurrent | Horizontal worker scaling |
| PR reviews | 500/day | Horizontal + GPU scaling |
| LLM inference | 200 concurrent devs / GPU | Multi-GPU, multi-node |
| Code search | 10M functions indexed | pgvector HNSW partitioning |
| Event processing | 10,000 events/sec | Kafka partition scaling |

### 6.2 Scale Targets (Year 3)

| Component | Target Capacity | Investment Required |
|---|---|---|
| CKG builds | 1,000 repos concurrent | $200K infrastructure |
| PR reviews | 10,000/day | 4 additional GPU nodes |
| LLM inference | 5,000 concurrent devs | GPU cluster expansion |
| Code search | 100M functions | pgvector sharding |
| Event processing | 100,000 events/sec | Kafka cluster expansion |

### 6.3 Architecture for Scale
- **Stateless services:** All Go microservices are stateless; scale horizontally via Kubernetes HPA
- **GPU autoscaling:** LLM inference nodes scale based on request queue depth
- **Database read replicas:** PostgreSQL replicas for read-heavy queries (dashboards, search)
- **CDN:** Frontend assets served via CDN for global performance
- **Edge caching:** Redis caching reduces database load by >90% for hot paths

---

## 7. Technology Differentiation Summary

| Technology | Competitive Advantage | Defensibility |
|---|---|---|
| Code Knowledge Graph | Enables codebase-level AI reasoning | 18-month engineering lead |
| Multi-language AST parsing | Supports 6 languages from day one | Tree-sitter expertise + custom extractors |
| Self-hosted LLM inference | Privacy guarantee for regulated industries | Architecture built for self-hosted from inception |
| Code embeddings (pgvector) | Semantic code search and duplicate detection | Fine-tuned CodeBERT on code understanding tasks |
| Event-driven architecture | Independent scaling, rapid new feature development | Kafka expertise, event schema stability |
| Mutation testing framework | Tests validated to catch real bugs, not just execute | Novel integration of mutation testing into AI test gen |

---

## 8. Technical Roadmap

| Quarter | Technical Investment | Business Impact |
|---|---|---|
| Q2 2026 | Test generation engine + mutation framework | Phase 2 launch |
| Q3 2026 | SAST engine with AI FP reduction | Security product launch |
| Q4 2026 | CI/CD build analysis + failure prediction | DevOps product expansion |
| Q1 2027 | IDE plugin framework (VS Code + JetBrains) | Developer experience expansion |
| Q2 2027 | Multi-repo CKG (cross-repository analysis) | Enterprise platform deepening |
| Q3 2027 | Custom model fine-tuning pipeline | Customer-specific AI quality |
| Q4 2027 | Architecture diagram generation from CKG | Architecture product expansion |

---

*Document Control: Architecture decisions recorded in ADR format. Changes require Architecture Review Board approval.*
