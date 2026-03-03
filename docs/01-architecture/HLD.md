# High-Level Design (HLD) -- Sovereign Code

**Module:** ERP-Autonomous-Coding | **Port:** 5182 | **Version:** 3.0 | **Date:** 2026-03-03

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEVELOPER INTERFACES                         │
│  VS Code Extension │ JetBrains Plugin │ CLI │ Web Dashboard      │
│  GitHub App │ GitLab Integration │ CI/CD Hooks                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API GATEWAY (Port 5182)                      │
│  Auth │ Rate Limiting │ WebSocket (IDE) │ Webhooks (Git)        │
└────────────────────────────┬────────────────────────────────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
┌────────────────┐ ┌────────────────┐ ┌─────────────────────────┐
│  CODE LLM      │ │ CODEBASE       │ │ ANALYSIS ENGINE         │
│  GATEWAY       │ │ INDEXER        │ │                         │
│                │ │                │ │ ┌─────────────────────┐ │
│ Code Generation│ │ AST Parser     │ │ │ Review Engine       │ │
│ Completion     │ │ Symbol Extract │ │ │ Test Generator      │ │
│ Review Analysis│ │ Embedding Gen  │ │ │ Security Scanner    │ │
│ Test Writing   │ │ Graph Builder  │ │ │ Debt Tracker        │ │
│ Doc Generation │ │ Incremental    │ │ │ Architecture Check  │ │
│                │ │ Sync           │ │ └─────────────────────┘ │
│ Fine-tuned LLM │ │                │ │                         │
│ + RAG Context  │ │ Neo4j Graph    │ │ Rule Engine + ML Models │
└────────────────┘ └────────────────┘ └─────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATA LAYER                                   │
│  PostgreSQL │ Neo4j │ pgvector │ S3 │ Redis │ Redpanda          │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Core Components

### 2.1 Code LLM Gateway

Abstracts model selection and prompt engineering for all code-related AI tasks.

| Task | Model | Context Budget | Latency Target |
|---|---|---|---|
| Line completion | Code Llama 34B (self-hosted) or Claude Haiku | 4K tokens | <200ms |
| Multi-line completion | Claude 3.5 Sonnet | 16K tokens | <500ms |
| Multi-file generation | Claude 3.5 Sonnet | 64K tokens | <30s |
| Code review | Claude 3.5 Sonnet | 32K tokens | <90s |
| Test generation | Claude 3.5 Sonnet | 32K tokens | <60s |
| Security analysis | Claude 3.5 Sonnet + rule engine | 16K tokens | <30s |
| Documentation | Claude 3.5 Sonnet | 16K tokens | <15s |

**Context Assembly for Code Tasks:**
1. Current file content (always included)
2. Related files from import graph (up to 3 hops)
3. Relevant code snippets from codebase index (semantic search)
4. Team style guide and linting rules
5. Architecture rules (layer constraints, naming conventions)
6. Test patterns from existing test files

### 2.2 Codebase Indexer

Maintains a comprehensive index of the entire codebase.

**Language Parsers:**

| Language | Parser | AST Support |
|---|---|---|
| Go | go/ast (stdlib) | Full |
| TypeScript/JavaScript | tree-sitter-typescript | Full |
| Python | tree-sitter-python | Full |
| Java | tree-sitter-java | Full |
| Rust | tree-sitter-rust | Full |
| C# | tree-sitter-c-sharp | Full |
| Ruby | tree-sitter-ruby | Full |
| SQL | tree-sitter-sql | Queries only |

**Indexing Pipeline:**
1. Git clone/pull → incremental diff since last index
2. Parse changed files into ASTs
3. Extract symbols (functions, classes, types, imports, exports)
4. Generate embeddings (code-specific model, 768 dimensions)
5. Update Neo4j graph (nodes, edges, relationships)
6. Update pgvector index (for semantic code search)
7. Trigger dependent analyses (security scan, debt recalculation)

**Index Refresh:**
- Full index: On repository connection (one-time, 5-15 minutes for 1M LOC)
- Incremental: On every push/commit (webhook-triggered, <30 seconds)
- Scheduled: Nightly dependency and security scan refresh

### 2.3 Analysis Engine

**Review Engine:**
- Parses PR diff into structured change set
- Classifies each change: new code, modification, deletion, refactor
- Runs pattern-matching rules (pre-defined + custom)
- Sends to LLM for semantic analysis (bugs, performance, architecture)
- Generates inline review comments with severity and suggested fix
- Produces PR summary with risk assessment

**Test Generator:**
- Parses target code into AST
- Identifies function signatures, input types, return types
- Queries knowledge graph for existing test patterns
- Generates test cases: happy path, edge cases, error paths
- Executes tests in sandboxed environment
- Reports coverage achieved and failures

**Security Scanner:**
- SAST: AST pattern matching for known vulnerability patterns
- Dependency: Cross-reference package manifests with CVE databases
- Secrets: Regex + entropy analysis + ML classifier for leaked credentials
- Config: Analyze Terraform, Kubernetes YAML for misconfigurations
- License: Check dependency licenses against organization's approved list

**Technical Debt Tracker:**
- Cyclomatic complexity analysis per function
- Clone detection (exact and near-miss duplicates)
- Test coverage gap analysis
- Dependency staleness scoring
- Architecture rule violation tracking
- Aggregate into composite debt score (0-100)

## 3. Security Architecture

| Concern | Control |
|---|---|
| Code privacy | Customer code processed in-memory only; never persisted on our servers. On-prem option stores everything locally. |
| Authentication | OAuth 2.0 with GitHub/GitLab SSO; API keys for CI/CD |
| Authorization | Repository-level and team-level permissions |
| LLM data handling | Code snippets sent to LLM are ephemeral; no training on customer code |
| Network | TLS 1.3 everywhere; optional VPN for on-prem |
| Audit | All AI suggestions, reviews, and actions logged with timestamps |

## 4. Deployment Options

| Model | Description | Target Customer |
|---|---|---|
| Cloud (SaaS) | Fully managed, multi-tenant | Startups, mid-market |
| Hybrid | Cloud control plane, on-prem inference | Enterprise |
| On-Premises | Fully self-hosted (air-gapped capable) | Government, defense, finance |

## 5. Technology Stack

| Layer | Technology |
|---|---|
| Backend | Go 1.22 (API, indexer), Python 3.12 (ML, analysis) |
| Frontend | React 18, Vite, Refine.dev, Ant Design, Monaco Editor |
| IDE Extensions | VS Code Extension API, JetBrains Plugin SDK |
| Code LLM | Claude 3.5 Sonnet (cloud), Code Llama 34B (self-hosted) |
| Code Parsing | tree-sitter (multi-language AST), go/ast |
| Graph DB | Neo4j (codebase knowledge graph) |
| Vector DB | pgvector (code embedding search) |
| Operational DB | PostgreSQL 16 |
| Cache | Redis 7 |
| Event Bus | Redpanda (shared with ERP modules) |
| CI/CD | GitHub Actions, ArgoCD |
| Container | Kubernetes (AWS EKS) |

---

*Confidential. Sovereign Code. All rights reserved.*
