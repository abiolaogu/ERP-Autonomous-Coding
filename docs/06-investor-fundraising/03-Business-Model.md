# Business Model -- Sovereign Dev

**Module:** ERP-Autonomous-Coding | **Port:** 5182 | **Version:** 2.0 | **Date:** 2026-03-03

---

## 1. Revenue Model

### 1.1 Primary Revenue: Per-Developer SaaS Subscription

| Tier | Monthly Price | Annual Price | Target Segment | Included Capabilities |
|---|---|---|---|---|
| **Starter** | $29/dev/mo | $290/dev/yr | Small teams (<20 devs) | Code generation, PR review, code search |
| **Professional** | $59/dev/mo | $590/dev/yr | Mid-market (20-200 devs) | + Test generation, security scanning, tech debt |
| **Enterprise** | $99/dev/mo | $990/dev/yr | Large enterprise (200+ devs) | + CI/CD intelligence, architecture analysis, SSO, audit |

**Pricing philosophy:** Per-developer pricing aligns cost with value. Each additional developer seat generates incremental productivity gains worth $161K/year -- a $29-99/month investment delivers 100-400x ROI.

### 1.2 Revenue Mix Projection

| Year | Starter % | Professional % | Enterprise % | Blended ARPU |
|---|---|---|---|---|
| Year 1 | 35% | 50% | 15% | $54/dev/mo |
| Year 2 | 20% | 50% | 30% | $63/dev/mo |
| Year 3 | 12% | 45% | 43% | $72/dev/mo |
| Year 4 | 8% | 38% | 54% | $79/dev/mo |
| Year 5 | 5% | 30% | 65% | $85/dev/mo |

**Enterprise mix grows** as product matures and sales team scales. This drives ARPU expansion without price increases.

### 1.3 Secondary Revenue Streams (Year 3+)

| Stream | Model | Projected Contribution |
|---|---|---|
| GPU Managed Hosting | Per-inference pricing for customers who don't self-host | 8% of revenue |
| Professional Services | Implementation, custom rule development, training | 5% of revenue |
| Marketplace | Third-party integrations and custom analyzers | 3% of revenue (Year 4+) |

---

## 2. Unit Economics

### 2.1 Customer Acquisition Cost (CAC)

| Channel | CAC | % of New Customers | Payback Period |
|---|---|---|---|
| Organic / PLG (free trial) | $1,200 | 35% | 3 months |
| Content marketing / SEO | $3,800 | 20% | 7 months |
| Inside sales | $8,500 | 25% | 11 months |
| Field sales (enterprise) | $28,000 | 15% | 14 months |
| Partner channel | $5,200 | 5% | 8 months |
| **Blended** | **$6,800** | **100%** | **11 months** |

### 2.2 Lifetime Value (LTV)

```
Average contract value (ACV): $67/dev/mo × 118 devs = $94,872/year
Gross margin: 78%
Annual churn rate: 8% (implied lifetime: 12.5 years, capped at 5 years)
Expansion rate: 135% NRR

LTV = ACV × Gross Margin × (1 / churn) = $94,872 × 0.78 × 5 = $370,000
LTV/CAC = $370,000 / $6,800 = 54x (per customer)

Per-developer:
LTV = $804/yr × 0.78 × 5 = $3,136
LTV/CAC per seat = $3,136 / $58 = 54x
```

### 2.3 Key Ratios

| Metric | Target | Benchmark (Best-in-Class SaaS) |
|---|---|---|
| LTV/CAC | 54x | >3x |
| CAC Payback | 11 months | <18 months |
| Gross Margin | 78% | >70% |
| Net Revenue Retention | 135% | >120% |
| Logo Churn | 8% annually | <10% |
| Magic Number | 1.4 | >1.0 |

---

## 3. Cost Structure

### 3.1 Cost of Goods Sold (COGS)

| Component | Cost/Developer/Month | % of Revenue | Notes |
|---|---|---|---|
| GPU compute (LLM inference) | $8.40 | 12.5% | Self-hosted vLLM, amortized |
| Cloud infrastructure | $3.20 | 4.8% | PostgreSQL, Redis, Kafka |
| Git provider API costs | $0.80 | 1.2% | GitHub/GitLab API rate limits |
| Customer support (allocated) | $2.10 | 3.1% | Per-developer allocation |
| **Total COGS** | **$14.50** | **21.6%** | |
| **Gross Margin** | **$52.50** | **78.4%** | |

**GPU cost trajectory:** GPU inference costs are declining ~40% annually. By Year 3, GPU COGS drops to $5.00/dev/month, expanding gross margin to 82%.

### 3.2 Operating Expenses

| Category | Year 1 | Year 2 | Year 3 | % of Revenue (Year 3) |
|---|---|---|---|---|
| Engineering | $4.2M | $7.8M | $11.5M | 35% |
| Sales & Marketing | $2.8M | $5.4M | $8.2M | 25% |
| General & Administrative | $1.1M | $1.8M | $2.6M | 8% |
| **Total OpEx** | **$8.1M** | **$15.0M** | **$22.3M** | **68%** |

### 3.3 Path to Profitability

| Year | Revenue | Gross Profit | OpEx | EBITDA | EBITDA Margin |
|---|---|---|---|---|---|
| Year 1 | $2.4M | $1.9M | $8.1M | -$6.2M | -258% |
| Year 2 | $11.8M | $8.7M | $15.0M | -$6.3M | -53% |
| Year 3 | $32.5M | $25.0M | $22.3M | $2.7M | **8%** |
| Year 4 | $58.2M | $46.0M | $35.4M | $10.6M | **18%** |
| Year 5 | $89.6M | $72.6M | $50.4M | $22.2M | **25%** |

**Cash flow positive in Month 28.** EBITDA positive in Year 3.

---

## 4. Expansion Revenue Engine

### 4.1 Seat Expansion
- Average customer starts with 32 developers (one team)
- Expands to 118 developers by month 18 (3.7x)
- Land with one engineering team, expand org-wide after proving ROI
- Seat expansion drives 80% of NRR expansion

### 4.2 Tier Upgrades
- 45% of Starter customers upgrade to Professional within 12 months
- 30% of Professional customers upgrade to Enterprise within 18 months
- Key triggers: team growth past tier thresholds, need for SSO/audit, security compliance requirements

### 4.3 Usage-Based Expansion
- Enterprise tier includes base allocation of code generations, security scans
- Overage billed per-use (code generation: $0.05/request, security scan: $0.10/scan)
- Usage-based component grows to 12% of Enterprise revenue by Year 3

### 4.4 Net Revenue Retention Waterfall

```
Starting ARR: $100
- Logo churn: -$8 (8% annual)
- Contraction: -$4 (downgrades, seat reduction)
+ Seat expansion: +$32
+ Tier upgrades: +$11
+ Usage expansion: +$4

Ending ARR: $135
Net Revenue Retention: 135%
```

---

## 5. Go-to-Market Model

### 5.1 Product-Led Growth (PLG) Foundation
- Free trial: 14-day full access, no credit card required
- Developer community: Open-source CKG analysis tools to build awareness
- Content: Technical blog, conference talks, open-source contributions
- Target: Individual developers and small teams who become internal champions

### 5.2 Sales-Assisted Growth
- Inside sales team handles $15K-$100K ACV deals
- Field sales for $100K+ ACV enterprise deals
- Solution engineering team for POC support and integration
- Customer success for expansion and renewal

### 5.3 Channel Strategy (Year 2+)
- **Technology partners:** GitHub Marketplace, GitLab Partner Program, Atlassian Marketplace
- **SI partners:** Deloitte, Accenture, Thoughtworks (embed in DevOps transformation engagements)
- **Cloud marketplace:** AWS Marketplace, Azure Marketplace, GCP Marketplace

---

## 6. Competitive Moat

### 6.1 Code Knowledge Graph (Technical Moat)
- Multi-language AST parsing, dependency graphs, convention extraction, code embeddings
- 18+ months of engineering investment; not replicable by adding an LLM wrapper
- Improves with every codebase analyzed (network effects within customer)

### 6.2 Privacy-First Architecture (Market Moat)
- Self-hosted LLM inference from day one -- not bolted on after cloud-first design
- Compliance-ready for regulated industries (FiServ, Healthcare, Government)
- Unlocks 34% of enterprise market that cannot use cloud-based AI tools

### 6.3 Unified Platform (Strategic Moat)
- Single platform replaces 5-7 point solutions
- Cross-feature intelligence: review findings improve test generation, security context improves review
- Switching cost increases with each capability adopted

### 6.4 Data Flywheel (Learning Moat)
- Every dismissed review finding trains better severity calibration
- Every accepted test improves generation quality
- Every false positive confirmation improves security accuracy
- Customer-specific learning stays within tenant boundary (privacy preserved)

---

## 7. Key Assumptions & Sensitivities

| Assumption | Base Case | Bull Case | Bear Case |
|---|---|---|---|
| Year 5 customers | 950 | 1,400 | 550 |
| Avg devs/customer | 118 | 145 | 85 |
| Blended ARPU | $85/mo | $95/mo | $72/mo |
| NRR | 135% | 150% | 115% |
| Logo churn | 8% | 5% | 14% |
| Year 5 ARR | $89.6M | $145M | $48M |

---

*Document Control: Financial model available upon request under NDA.*
