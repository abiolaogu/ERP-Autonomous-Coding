# Team & Hiring Plan -- Sovereign Dev

**Module:** ERP-Autonomous-Coding | **Port:** 5182 | **Version:** 2.0 | **Date:** 2026-03-03

---

## 1. Current Team

### 1.1 Leadership

| Role | Name | Background | Equity |
|---|---|---|---|
| CEO / Co-Founder | [Redacted] | 15 years developer tools; VP Engineering at [enterprise SaaS]; built 200-person engineering org | 28% |
| CTO / Co-Founder | [Redacted] | ML/NLP researcher; 8 years code analysis platforms; 15 papers published; ex-Google AI | 22% |
| VP Engineering | [Redacted] | Former Staff Engineer at GitHub; built Copilot infrastructure; 12 years distributed systems | 4% |
| Head of AI/ML | [Redacted] | PhD program analysis; 12 publications on AI-assisted development; ex-Microsoft Research | 3% |
| Head of Security | [Redacted] | Former AppSec lead at [Fortune 500]; built SAST tools for 500+ repos; CISSP, OSCP | 2% |

### 1.2 Current Engineering Team (18 people)

| Function | Headcount | Key Skills |
|---|---|---|
| CKG / Backend | 5 | Go, PostgreSQL, Apache AGE, Tree-sitter |
| AI/ML Engineering | 4 | PyTorch, vLLM, CodeBERT, fine-tuning, evaluation |
| Code Analysis | 3 | AST parsing, static analysis, data flow analysis |
| Frontend | 3 | React, TypeScript, Vite, Refine.dev |
| Platform / DevOps | 2 | Kubernetes, GPU infrastructure, CI/CD |
| Security Engineering | 1 | SAST, SCA, vulnerability research |

### 1.3 Current Non-Engineering (8 people)

| Function | Headcount | Roles |
|---|---|---|
| Product | 2 | Head of Product, Product Manager |
| Design | 1 | Senior Product Designer |
| Sales | 2 | VP Sales, Account Executive |
| Marketing | 1 | Head of Growth |
| Operations | 2 | Finance Controller, Office Manager |

**Total current headcount: 26**

---

## 2. Hiring Plan (Post Series A)

### 2.1 Year 1 Target: 35 total (hire 9)

| Department | Current | Hire | Target | Priority Roles |
|---|---|---|---|---|
| Engineering | 18 | 4 | 22 | Senior ML Engineer, Senior Backend (2), Security Engineer |
| Sales | 2 | 3 | 5 | Account Executives (2), Solutions Engineer |
| Customer Success | 0 | 2 | 2 | Customer Success Manager, Support Engineer |
| Marketing | 1 | 1 | 2 | Content Marketing Manager |
| Operations | 5 | -1 | 4 | (consolidate roles) |
| **Total** | **26** | **9** | **35** | |

### 2.2 Year 2 Target: 66 total (hire 31)

| Department | Current | Hire | Target | Priority Roles |
|---|---|---|---|---|
| Engineering | 22 | 10 | 32 | ML Engineers (3), Backend (3), Frontend (2), Platform (2) |
| Sales | 5 | 9 | 14 | AEs (6), SEs (2), Sales Manager |
| Customer Success | 2 | 3 | 5 | CSMs (2), Support Lead |
| Marketing | 2 | 3 | 5 | Demand Gen, Events, Developer Relations |
| Product | 2 | 2 | 4 | Product Managers (2) |
| Operations | 4 | 2 | 6 | HR Lead, Legal Counsel |
| **Total** | **35** | **31** | **66** | |

### 2.3 Year 3 Target: 100 total (hire 34)

| Department | Year 2 | Hire | Target |
|---|---|---|---|
| Engineering | 32 | 13 | 45 |
| Sales | 14 | 8 | 22 |
| Customer Success | 5 | 5 | 10 |
| Marketing | 5 | 3 | 8 |
| Product | 4 | 1 | 5 |
| Operations | 6 | 2 | 8 |
| Design | 1 | 1 | 2 |
| **Total** | **66** | **34** | **100** |

---

## 3. Critical Hires (First 6 Months Post-Close)

### Hire #1: Senior ML Engineer -- Code Understanding
- **Why:** Scale CKG embedding pipeline and improve code generation quality
- **Profile:** 5+ years ML engineering; experience with code models (CodeBERT, StarCoder, CodeLlama); production LLM deployment
- **Compensation:** $220K base + 0.3% equity
- **Impact:** Improve code generation first-attempt acceptance from 72% to 85%

### Hire #2: Senior Backend Engineer -- Review Engine
- **Why:** Scale automated review to handle 500+ PRs/day with <10 minute SLA
- **Profile:** 7+ years Go/distributed systems; experience with GitHub API at scale; event-driven architecture
- **Compensation:** $210K base + 0.25% equity
- **Impact:** 10x review throughput, sub-5-minute review for 80% of PRs

### Hire #3: Senior Backend Engineer -- Test Generation
- **Why:** Build mutation testing framework and scale test generation pipeline
- **Profile:** 5+ years backend; experience with testing frameworks, mutation testing, code instrumentation
- **Compensation:** $200K base + 0.25% equity
- **Impact:** Launch test generation feature (Phase 2 critical path)

### Hire #4: Security Engineer -- Scanner & FP Reduction
- **Why:** Expand SAST rule coverage and improve AI false positive reduction accuracy
- **Profile:** 5+ years AppSec; SAST tool development experience; ML for security applications
- **Compensation:** $210K base + 0.2% equity
- **Impact:** Expand vulnerability coverage to CWE Top 25, reduce FP rate to <8%

### Hire #5: Account Executive -- Mid-Market
- **Why:** Convert PLG leads into paid contracts
- **Profile:** 3+ years B2B SaaS sales; developer tools experience; $500K-$1M quota track record
- **Compensation:** $130K base + $130K OTE + 0.1% equity
- **Impact:** Close $1.5M ARR in first year

### Hire #6: Account Executive -- Mid-Market
- **Why:** Second AE to parallel sales capacity
- **Profile:** Same as Hire #5
- **Compensation:** Same as Hire #5
- **Impact:** Close $1.5M ARR in first year

### Hire #7: Solutions Engineer
- **Why:** Support mid-market and enterprise POCs
- **Profile:** Former developer turned SE; Go/Python/TypeScript; GitHub/GitLab expertise
- **Compensation:** $180K base + 0.15% equity
- **Impact:** Increase POC win rate from 40% to 65%

### Hire #8: Customer Success Manager
- **Why:** Drive onboarding, adoption, and expansion for first 50 customers
- **Profile:** 3+ years CSM in developer tools; technical background; expansion selling experience
- **Compensation:** $140K base + $40K variable + 0.1% equity
- **Impact:** Drive NRR from 125% to 135%

### Hire #9: Content Marketing Manager
- **Why:** Fuel PLG engine with technical content
- **Profile:** Developer background + marketing; technical blog writing; SEO expertise
- **Compensation:** $140K base + 0.1% equity
- **Impact:** 50,000 unique visitors/month, 200 trial signups/month

---

## 4. Compensation Philosophy

### 4.1 Principles
- Pay at 75th percentile of Bay Area tech salaries (competitive with FAANG)
- Meaningful equity grants for early employees (0.1-0.5% for first 50 hires)
- Performance-based equity refreshes annually
- Remote-first with optional office (San Francisco)

### 4.2 Salary Bands

| Level | Engineering | Sales (OTE) | Other |
|---|---|---|---|
| Junior (L3) | $140-170K | N/A | $100-130K |
| Mid (L4) | $170-200K | $180-220K | $130-160K |
| Senior (L5) | $200-240K | $230-280K | $160-200K |
| Staff (L6) | $240-290K | $300-360K | $200-240K |
| Principal / Director | $290-350K | $360-450K | $240-300K |
| VP | $320-400K | $400-500K | $280-350K |

### 4.3 Equity Pool
- Total option pool: 15% of fully diluted shares
- Allocated: 7.2% (current team)
- Available: 7.8% (post Series A, pre-refresh)
- 4-year vesting with 1-year cliff
- Standard strike price at FMV (409A valuation)

---

## 5. Engineering Culture & Practices

### 5.1 Core Values
1. **Ship quality** -- We eat our own dog food. Sovereign Dev reviews Sovereign Dev's code.
2. **Privacy is non-negotiable** -- We never compromise on code privacy, even internally.
3. **Measure everything** -- DORA metrics, mutation scores, false positive rates. Data-driven decisions.
4. **Developer empathy** -- We build for developers because we are developers.
5. **Speed with rigor** -- Ship fast, but every PR is reviewed (by AI and human) and every test is mutation-tested.

### 5.2 Engineering Practices
- All PRs reviewed by Sovereign Dev (AI) + human reviewer
- >90% mutation testing score for all new code
- Weekly architecture reviews for cross-cutting changes
- Bi-weekly demos (all hands can see what shipped)
- Quarterly hackathons (winners get implemented)

### 5.3 Remote-First Infrastructure
- Asynchronous communication default (Slack for questions, Notion for decisions)
- Core overlap hours: 10am-2pm Pacific (for meetings, pairing)
- In-person offsites quarterly (3 days, team building + strategy)
- Home office stipend: $2,500/year
- Conference travel budget: $5,000/year per engineer

---

## 6. Advisory Board

| Advisor | Background | Contribution | Equity |
|---|---|---|---|
| [Redacted] | Former CTO, GitLab | Product strategy, enterprise GTM | 0.25% |
| [Redacted] | GP at [VC firm] | Fundraising, board governance | 0.15% |
| [Redacted] | VP AppSec, [Bank] | Security product direction, enterprise pilot | 0.15% |
| [Redacted] | Professor, [University] | AI/ML research, academic partnerships | 0.10% |
| [Redacted] | Former VP Eng, [unicorn] | Engineering scaling, hiring | 0.10% |

---

## 7. Organizational Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Key person dependency (CTO) | Medium | High | Document CKG architecture; hire Principal ML Engineer |
| Hiring competition from FAANG | High | Medium | Competitive equity; mission-driven culture; remote flexibility |
| Sales team ramp too slow | Medium | Medium | Hire experienced AEs; invest in sales enablement |
| Engineering burnout | Medium | Medium | Sustainable pace; no crunch; 20% time for exploration |
| Culture dilution during scaling | Medium | Medium | Explicit values; structured onboarding; regular culture surveys |

---

*Document Control: Org chart and hiring plan reviewed quarterly with CEO and Board.*
