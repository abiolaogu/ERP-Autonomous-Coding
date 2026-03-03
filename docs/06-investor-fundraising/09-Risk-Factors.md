# Risk Factors -- Sovereign Dev

**Module:** ERP-Autonomous-Coding | **Port:** 5182 | **Version:** 2.0 | **Date:** 2026-03-03

---

## 1. Technology Risks

### 1.1 LLM Quality Degradation

| Attribute | Assessment |
|---|---|
| **Risk:** | Self-hosted LLM produces lower quality outputs than cloud-based alternatives (GPT-4, Claude) |
| **Probability:** | Medium |
| **Impact:** | High -- code generation quality is core value proposition |
| **Mitigation:** | Model-agnostic architecture supports swapping models; fine-tuning on customer codebases; continuous evaluation benchmarks; fallback to larger models for complex tasks |
| **Leading indicator:** | First-attempt acceptance rate <60% |

### 1.2 Code Knowledge Graph Scalability

| Attribute | Assessment |
|---|---|
| **Risk:** | CKG build and query performance degrades with large repositories (>5M LOC) |
| **Probability:** | Medium |
| **Impact:** | High -- enterprise customers have the largest repositories |
| **Mitigation:** | Incremental CKG updates (only changed files); tiered caching (Redis for hot paths); horizontal scaling of parse workers; query optimization with Apache AGE indexes |
| **Leading indicator:** | CKG build time >30 minutes or query latency >500ms |

### 1.3 Multi-Language Parser Maintenance

| Attribute | Assessment |
|---|---|
| **Risk:** | Tree-sitter parsers require continuous updates for new language features (Go generics, Python 3.12+ syntax) |
| **Probability:** | High |
| **Impact:** | Medium -- incorrect parsing leads to CKG errors |
| **Mitigation:** | Active contribution to Tree-sitter community; automated parser regression testing; parser version pinning with controlled upgrades |
| **Leading indicator:** | Parse error rate >2% on new code |

### 1.4 AI False Positive/Negative Rates

| Attribute | Assessment |
|---|---|
| **Risk:** | AI-powered security analysis produces too many false positives (>10%) or misses real vulnerabilities (false negatives) |
| **Probability:** | Medium |
| **Impact:** | High -- developers lose trust in the platform |
| **Mitigation:** | Continuous evaluation against known vulnerability benchmarks; human-in-the-loop review for uncertain findings; customer feedback loop; regular model retraining |
| **Leading indicator:** | FP rate trending upward; customer dismissal rate >30% |

---

## 2. Market Risks

### 2.1 GitHub Copilot Feature Expansion

| Attribute | Assessment |
|---|---|
| **Risk:** | GitHub (Microsoft) adds automated review, security scanning, and test generation to Copilot, bundled free with GitHub Enterprise |
| **Probability:** | High |
| **Impact:** | High -- Copilot has dominant distribution |
| **Mitigation:** | CKG depth provides superior analysis quality; privacy-first positioning for regulated industries; faster innovation cycle; unified platform with cross-feature intelligence |
| **Status:** | Copilot has added basic PR review (2025) but lacks CKG-level depth, mutation-tested testing, or <10% FP security scanning |

### 2.2 Market Timing

| Attribute | Assessment |
|---|---|
| **Risk:** | Enterprise AI adoption slower than projected due to budget constraints, AI skepticism, or compliance concerns |
| **Probability:** | Medium |
| **Impact:** | Medium -- delays revenue ramp, extends time to profitability |
| **Mitigation:** | PLG motion ensures low-friction adoption; design partner program validates enterprise readiness; per-developer pricing reduces procurement friction; compliance certifications (SOC2, ISO 27001) in progress |
| **Leading indicator:** | Trial-to-paid conversion <8%; sales cycle >6 months average |

### 2.3 Price Competition / Race to Bottom

| Attribute | Assessment |
|---|---|
| **Risk:** | Competitors (especially well-funded like Cursor) offer similar capabilities at lower prices or free |
| **Probability:** | Medium |
| **Impact:** | Medium -- compresses margins, slows growth |
| **Mitigation:** | Value-based pricing tied to $161K/developer savings; enterprise features (SSO, audit, compliance) justify premium; platform stickiness increases switching costs; no free tier to avoid value erosion |
| **Leading indicator:** | Win rate declining; price as top-3 loss reason |

### 2.4 Open-Source Disruption

| Attribute | Assessment |
|---|---|
| **Risk:** | Open-source projects replicate core Sovereign Dev capabilities (e.g., OSS CKG + review + testing) |
| **Probability:** | Medium |
| **Impact:** | Medium -- erodes SMB market, less impact on enterprise |
| **Mitigation:** | Enterprise features (SSO, RBAC, audit, compliance) not replicable in OSS; customer-specific data flywheel; professional support and SLAs; contribute to OSS strategically to build community |
| **Leading indicator:** | OSS alternative with >5,000 GitHub stars and enterprise adoption |

---

## 3. Execution Risks

### 3.1 Hiring Key Technical Talent

| Attribute | Assessment |
|---|---|
| **Risk:** | Cannot hire senior ML engineers and code analysis specialists fast enough |
| **Probability:** | High |
| **Impact:** | High -- delays product roadmap |
| **Mitigation:** | Competitive compensation (75th percentile + meaningful equity); remote-first attracts global talent; strong technical brand through OSS and conference presence; referral bonuses ($15K); acqui-hire opportunities |
| **Leading indicator:** | Open roles unfilled >90 days; offer acceptance rate <60% |

### 3.2 Product-Market Fit Uncertainty

| Attribute | Assessment |
|---|---|
| **Risk:** | Design partners do not convert to paying customers; feature priorities misaligned with market needs |
| **Probability:** | Low-Medium |
| **Impact:** | High -- fundamentally challenges the business |
| **Mitigation:** | 5 design partners with LOI for paid conversion; continuous user research; rapid iteration on feedback; NPS tracking with root cause analysis |
| **Leading indicator:** | NPS <30; design partner churn; feature adoption <40% |

### 3.3 Sales Execution

| Attribute | Assessment |
|---|---|
| **Risk:** | Sales team ramp takes longer than expected; enterprise sales cycles extend |
| **Probability:** | Medium |
| **Impact:** | Medium -- delays revenue, increases burn |
| **Mitigation:** | Hire experienced AEs with developer tool sales background; robust sales enablement (playbooks, competitive battle cards, ROI calculators); PLG pipeline provides qualified leads; SE team supports complex evaluations |
| **Leading indicator:** | AE ramp >6 months; pipeline coverage <3x |

### 3.4 Integration Complexity

| Attribute | Assessment |
|---|---|
| **Risk:** | Enterprise customers require extensive customization and integration work that consumes engineering resources |
| **Probability:** | Medium |
| **Impact:** | Medium -- diverts engineering from product to services |
| **Mitigation:** | Standardized integration framework (GitHub, GitLab, Bitbucket); solution engineering team handles custom work; API-first architecture enables customer self-service; professional services arm for complex deployments |
| **Leading indicator:** | Integration time >2 weeks; >20% of engineering time on customer-specific work |

---

## 4. Financial Risks

### 4.1 GPU Cost Volatility

| Attribute | Assessment |
|---|---|
| **Risk:** | GPU costs do not decline as projected, or demand spikes cause pricing increases |
| **Probability:** | Low-Medium |
| **Impact:** | Medium -- compresses gross margin |
| **Mitigation:** | Multi-cloud GPU procurement (AWS, GCP, CoreWeave); long-term reserved instances; smaller model development for common tasks; progressive quantization (INT8, INT4); customer self-hosted GPU option shifts cost |
| **Leading indicator:** | GPU cost per inference request increasing QoQ |

### 4.2 Burn Rate Exceeds Plan

| Attribute | Assessment |
|---|---|
| **Risk:** | Hiring and infrastructure costs exceed projections, shortening runway |
| **Probability:** | Medium |
| **Impact:** | Medium -- forces premature fundraise or cost cuts |
| **Mitigation:** | Conservative hiring plan with clear milestones; monthly burn review with board; $0.9M reserve buffer; 18-month runway at planned burn; hiring gated on revenue milestones |
| **Leading indicator:** | Monthly burn >110% of plan for 2+ consecutive months |

### 4.3 Revenue Concentration

| Attribute | Assessment |
|---|---|
| **Risk:** | Top 3-5 customers represent >40% of revenue; loss of one customer significantly impacts ARR |
| **Probability:** | High (early stage) |
| **Impact:** | Medium -- revenue volatility |
| **Mitigation:** | Aggressive new logo acquisition; no single customer >15% of ARR by Year 2; multi-year contracts for large customers; CSM-driven retention program |
| **Leading indicator:** | Top customer >25% of ARR |

---

## 5. Regulatory & Legal Risks

### 5.1 AI Code Generation Liability

| Attribute | Assessment |
|---|---|
| **Risk:** | AI-generated code introduces bugs or security vulnerabilities, leading to customer liability claims |
| **Probability:** | Medium |
| **Impact:** | High -- reputational and legal exposure |
| **Mitigation:** | Human-in-the-loop (all generated code requires human approval); clear terms of service disclaiming generated code warranty; automated quality gates (compilation, linting, testing); E&O insurance; generated code clearly attributed |
| **Leading indicator:** | Customer incident involving AI-generated code |

### 5.2 IP and Copyright Concerns

| Attribute | Assessment |
|---|---|
| **Risk:** | AI-generated code may reproduce copyrighted code from training data, creating IP liability |
| **Probability:** | Low-Medium |
| **Impact:** | Medium -- legal exposure |
| **Mitigation:** | Self-hosted models fine-tuned only on customer's own code; code originality detection (similarity to known OSS); customer indemnification clause; training data provenance tracking |
| **Leading indicator:** | Legal challenges against AI code generation industry |

### 5.3 Data Privacy Regulation

| Attribute | Assessment |
|---|---|
| **Risk:** | New regulations restrict AI processing of source code or require additional compliance measures |
| **Probability:** | Medium |
| **Impact:** | Low -- privacy-first architecture is already compliant |
| **Mitigation:** | Self-hosted architecture provides maximum compliance flexibility; no code leaves tenant boundary; SOC2 Type II certification (in progress); GDPR-compliant data processing; EU AI Act transparency requirements supported |
| **Leading indicator:** | New regulation specifically targeting AI code analysis |

---

## 6. Risk Summary Matrix

| Risk Category | Risk | Probability | Impact | Severity | Mitigation Status |
|---|---|---|---|---|---|
| Technology | LLM quality degradation | Medium | High | **High** | Active |
| Technology | CKG scalability | Medium | High | **High** | Active |
| Technology | AI FP/FN rates | Medium | High | **High** | Active |
| Market | GitHub Copilot expansion | High | High | **Critical** | Active |
| Market | Price competition | Medium | Medium | **Medium** | Planned |
| Market | OSS disruption | Medium | Medium | **Medium** | Planned |
| Execution | Hiring key talent | High | High | **Critical** | Active |
| Execution | Sales execution | Medium | Medium | **Medium** | Planned |
| Financial | GPU cost volatility | Low-Med | Medium | **Low-Med** | Active |
| Financial | Burn rate | Medium | Medium | **Medium** | Active |
| Legal | AI code liability | Medium | High | **High** | Active |
| Legal | IP/copyright | Low-Med | Medium | **Low-Med** | Active |

---

*Document Control: Risk register reviewed monthly by leadership team and quarterly with Board.*
