# Sovereign Code -- Investor FAQ

**Confidential | Series A | March 2026**

---

## 20 Hard Questions

### Q1: GitHub Copilot has 1.3M subscribers and Microsoft behind it. Why would anyone choose you?

Because Copilot does one thing: code completion. We do six things: completion, automated review, test generation, security scanning, technical debt management, and architecture enforcement. An enterprise buying Copilot still needs Snyk for security ($30/dev), SonarQube for quality ($10/dev), and manual code review (4.5 hours per PR). Our Enterprise tier at $60/dev replaces all three plus Copilot ($19/dev) -- at roughly the same total cost but with a shared knowledge graph that makes every feature better. We win 78% of competitive evaluations where Copilot is in the deal because the full-lifecycle value is immediately obvious in a 30-day trial.

### Q2: What is a knowledge graph and why does it matter for code AI?

GitHub Copilot sees the file you are editing. Sovereign Code sees your entire codebase: every function, class, API endpoint, dependency, test, and their relationships -- stored in a Neo4j graph database with 450K+ nodes and 3.2M+ edges across our customer base. This means our completion suggestions understand your project's architecture patterns, our reviews catch violations of your design rules, our tests use your existing test patterns, and our security scanner knows your custom validation functions. A completion tool that only sees the current file is like a doctor who diagnoses based on one symptom. Our knowledge graph gives us the full medical history.

### Q3: Your completion acceptance rate is 34%. That means 66% of suggestions are rejected. Is that good?

Yes -- 34% is at the top of the industry. GitHub Copilot reports ~30% acceptance rate. Cursor is similar. The 66% "rejection" includes: (a) suggestions the developer saw and chose a different approach (not wrong, just different), (b) suggestions shown but not needed (developer was browsing, not coding), (c) suggestions on auto-complete that the developer would have typed manually in the same time. The meaningful metric is time saved: developers using our platform complete coding tasks 2.8x faster in controlled A/B studies. The acceptance rate is a proxy, and 34% is best-in-class.

### Q4: How do you handle code privacy? Enterprise customers will not send their proprietary code to a third-party API.

Three-tier approach:
1. **Cloud mode:** Code snippets are sent to LLM providers for processing but never persisted. Contracts with Anthropic and OpenAI explicitly prohibit training on our customers' code. Code is processed in-memory on our servers and never written to disk.
2. **Hybrid mode:** Customer hosts the inference layer (GPU servers running Code Llama in their VPC). Our control plane orchestrates but never sees source code.
3. **On-premises mode:** Entire platform runs in the customer's infrastructure. Air-gapped deployment possible. Zero data leaves their network.

For our most security-sensitive customers (financial services, healthcare, government), on-prem is the answer. We charge a premium for it (Enterprise tier), which is why it is our highest-margin tier.

### Q5: What about the IP/copyright risk of AI-generated code?

This is a real legal concern that we address proactively:
1. Our models are primarily trained on permissively licensed code (MIT, Apache 2.0, BSD).
2. We run duplicate detection that filters out near-exact copies of training data before suggesting code.
3. Customer agreements explicitly assign all IP of generated code to the customer.
4. We do not claim any IP over code our platform generates.
5. We monitor legal developments (pending GitHub Copilot class action) and adjust training data practices accordingly.
6. Our knowledge graph approach is inherently safer than pure generation: we are helping the developer write code in their existing patterns, not generating novel code from a training corpus.

### Q6: How do you prevent AI-generated code from introducing security vulnerabilities?

Every AI-generated code snippet passes through our security scanner before delivery to the developer:
1. **Pre-suggestion SAST:** Generated code is parsed and checked against OWASP Top 10 patterns
2. **Secrets scan:** No API keys, passwords, or tokens in suggestions
3. **Unsafe pattern detection:** SQL injection, XSS, deserialization, path traversal
4. **Dependency safety:** If generated code imports a package, we check it against CVE databases

Additionally, our automated PR review catches any vulnerabilities that make it into a pull request. The combination of pre-suggestion and pre-merge scanning creates defense-in-depth. In our customer base, security vulnerabilities reaching production have decreased 89% since adoption.

### Q7: NRR of 152% seems high. Break it down.

Expansion drivers:
1. **Developer expansion (55%):** Team starts with 30 developers, other teams request access, organization standardizes. Our largest customer grew 40 → 400 developers in 10 months.
2. **Tier upgrade (25%):** Teams start on Starter ($20/dev), see review and test value, upgrade to Professional ($40/dev). Security team requirements push to Enterprise ($60/dev).
3. **Repository expansion (20%):** After proving value on main product repo, teams add libraries, microservices, and infrastructure-as-code repos.

We model NRR declining to 132% by 2030. Even at 132%, this is best-in-class for developer tools (GitHub: ~125%, Datadog: ~130%).

### Q8: Your on-prem deployment adds significant engineering complexity. Is it worth it?

Absolutely. On-prem accounts for 28% of our current ARR but only 12% of our customer count -- meaning on-prem customers have 2.3x larger ACVs. Financial services, healthcare, and government organizations require on-prem for compliance. These are our highest-value, stickiest customers. The engineering cost is real (~15% of engineering effort) but the revenue and competitive moat justify it. Copilot, Cursor, and Codeium do not offer on-prem. Tabnine does, but without our full lifecycle features.

### Q9: How do you charge for AI features that will become commoditized?

Our pricing is not for the AI -- it is for the integration, context, and lifecycle coverage. Specifically:
1. **Knowledge graph context** -- understanding the codebase, not just the file
2. **Full lifecycle coverage** -- replacing 4-5 tools with one platform
3. **Architecture enforcement** -- custom rules enforced automatically
4. **Enterprise features** -- SSO, on-prem, audit trails, compliance

As AI becomes commoditized (which we welcome -- it reduces our COGS), the value of our integration layer, knowledge graph, and enterprise features increases. Better LLMs make our product better without reducing our competitive advantage.

### Q10: What is your gross margin, and how sensitive is it to LLM costs?

Current gross margin: 76%. We project 86% by 2030. Key dynamics:
- 40% of queries use self-hosted Code Llama (very low marginal cost)
- 45% use Claude Haiku ($0.0008/query)
- 15% use Claude Sonnet ($0.008/query)
- Blended cost: ~$0.003 per suggestion

Even if API costs doubled, gross margin would be 71% (still healthy). LLM costs have historically declined 30-50% annually. Self-hosted inference provides a permanent cost floor. GPU efficiency improvements benefit us directly.

### Q11: How large can customer codebases be? What are your scale limits?

Current: largest customer has 2.8M lines of code across 47 repositories. Our knowledge graph handles this comfortably.

Architecture limits:
- Neo4j: Tested to 5M nodes (equivalent to ~10M LOC). Horizontal scaling available.
- pgvector: Tested to 2M embeddings per tenant. Partitioned by repository.
- Incremental indexing: <30 seconds even for 5M LOC repos (only changes processed).
- Full re-index: ~30 minutes for 5M LOC (one-time operation).

Target by Q4 2027: Support monorepos up to 10M LOC. This covers 99% of enterprise codebases.

### Q12: What is your developer attrition rate, and how do you retain AI talent?

Current engineering attrition: 4.3% annualized (1 departure in 14 months from 22 engineers). Well below industry average of 15-20%.

Retention:
- **Mission:** Building the future of how software is written. Our engineers use our own product daily (dogfooding).
- **Equity:** 0.1-0.5% for early engineers with refresh grants.
- **Compensation:** SF market rates + equity = $280-400K total comp for senior engineers.
- **Research culture:** Engineers publish papers, speak at conferences, contribute to open source.
- **Team quality:** Working alongside ex-DeepMind, ex-FAIR, ex-JetBrains colleagues.

### Q13: What happens if a customer deploys your tool and code quality gets worse?

This has not happened in any deployment. However, we have safety nets:
1. **Measurable baseline:** Before deployment, we establish code quality baseline (complexity, coverage, vulnerability count, review cycle time).
2. **Continuous monitoring:** Dashboard tracks all quality metrics over time. If any metric regresses, CSM is alerted.
3. **Configurable thresholds:** Teams can set minimum review scores (e.g., block merge if score <60).
4. **Easy rollback:** Any feature can be disabled per team or per repository without affecting others.

### Q14: How accurate is your test generation? Do generated tests actually catch bugs?

Generated tests achieve >80% line coverage on target code. 90% of generated tests pass on first execution. The remaining 10% have issues we flag for human review (typically complex mocking requirements or environment-specific dependencies).

Do they catch bugs? Yes. In our customer base, generated tests have caught 127 bugs in the last quarter that would not have been caught by existing test suites. The most common: edge cases (null inputs, empty arrays, boundary values) that developers consistently under-test.

### Q15: What is your CAC, and does it scale efficiently?

CAC is $28,000 fully loaded. This is low for enterprise developer tools because:
1. Bottom-up adoption: developers try free, love it, tell their team
2. 30-day trial costs us ~$50 in LLM inference per developer
3. Trial-to-pilot: 50%. Pilot-to-close: 72%. Low waste.
4. DevRel is our highest-ROI channel: technical blog posts and conference talks generate $3M pipeline annually for $360K spend

We project CAC increasing to $40K by 2030 as we move upmarket, but ACV increases faster ($100K → $225K), improving payback from 3.8 to 2.8 months.

### Q16: How do you compete with Cursor, which raised $60M and has strong developer love?

Cursor is an excellent product for individual developers: it reimagined the IDE around AI. But Cursor has three structural limitations for enterprise:
1. **IDE replacement:** Cursor requires developers to switch from VS Code/JetBrains. We integrate with their existing IDE.
2. **Single feature:** Cursor does completion/editing. No review, testing, security, or debt management.
3. **No enterprise features:** No SSO, no on-prem, no architecture enforcement, no admin controls.

We respect Cursor's UX innovation but compete on a different axis: full lifecycle + enterprise readiness.

### Q17: Your security scanning competes with Snyk ($300M ARR). Why would customers choose your scanner?

They do not choose our scanner instead of Snyk -- they choose our platform that includes scanning. The value proposition is not "better Snyk" but "Copilot + Snyk + SonarQube in one platform at the same price." Our OWASP detection rate (>95%) is comparable to Snyk, but Snyk cannot complete code, review PRs, generate tests, or track debt. For customers who want best-of-breed security only, Snyk is the right choice. For customers who want a unified developer platform, we win.

### Q18: What are the unit economics on your on-prem deployment?

On-prem customers require: (a) deployment support ($15K one-time), (b) higher base price (Enterprise tier only, $60/dev), (c) annual support contract (included in subscription). Our margin on on-prem is actually higher than cloud because the customer bears infrastructure costs. We ship a Helm chart + container images; they run it on their Kubernetes cluster. No cloud COGS for us. On-prem is 28% of ARR today and we expect it to grow to 35% as we enter regulated industries.

### Q19: Why $18M and not $12M or $25M?

$18M buys three specific outcomes:
1. **Product:** JetBrains plugin, on-prem GA, custom fine-tuning (widens moat)
2. **GTM:** 10 new AEs + DevRel team (converts $5.6M pipeline)
3. **Compliance:** SOC 2 Type II + ISO 27001 (unlocks regulated industries)

$12M forces us to choose product OR GTM. $25M is excess capital with unnecessary dilution -- our burn profile and revenue trajectory do not require it.

### Q20: Walk me through the realistic downside.

**What goes wrong:** Sales cycles extend to 8+ months. We add 35 customers by 2028 instead of 110. NRR declines to 120%.

**Financial impact:** 2028 ARR of $9-11M instead of $22M. Gross margin holds at 80%+. Company burns through $18M over 28 months.

**Response options:**
1. Raise smaller Series B ($15-20M at $100-150M)
2. Shift to profitability at $250K/month burn
3. Strategic sale: at $10M ARR with knowledge graph IP, worth $150-300M to Microsoft, Atlassian, or JetBrains

**Investor protection:** 1x liquidation preference returns $18M before common. Technology IP (knowledge graph, multi-language AST, full-lifecycle platform) creates $50-100M valuation floor. Probability of total loss: <3%.

---

*Confidential. Sovereign Code, Inc. All rights reserved.*
