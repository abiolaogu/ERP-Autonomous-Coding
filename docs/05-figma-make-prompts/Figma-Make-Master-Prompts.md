# Figma & Make.com Master Prompts -- Sovereign Dev

**Module:** ERP-Autonomous-Coding | **Port:** 5182 | **Version:** 2.0 | **Date:** 2026-03-03

---

## Inputs to Attach Before Prompting

1. **BRD.md** and **PRD.md** -- Requirements
2. **HLD.md** and **LLD.md** -- Architecture
3. **Data-Architecture.md** -- Data model
4. **Brand Kit** -- Sovereign brand system

---

## Screen 1: Developer Dashboard (Home)

### Figma Prompt

```
Design a developer dashboard for Sovereign Dev, an AI-powered coding platform.

TOP BAR:
- Logo: "Sovereign Dev"
- Repository selector dropdown (current repo + recent repos)
- Branch selector
- Global search: "Search code, PRs, findings..."
- Notification bell with count
- User avatar + settings

MAIN CONTENT (4-column metric cards + 2-column panels):

METRIC CARDS (top row, 4 across):
- "PR Review Queue": 3 PRs waiting, avg wait: 12 min, trend arrow
- "Test Coverage": 78.4% (+2.1% this week), sparkline
- "Security Findings": 2 critical, 5 high, trend
- "Tech Debt Score": 34/100 (Yellow), trend

LEFT PANEL (60%):
- "Recent Activity" feed:
  - "AI reviewed PR #247: 2 suggestions, 0 blockers" - 12 min ago
  - "Tests generated for payment_handler.go: 8 tests, 94% mutation score" - 1 hr ago
  - "Security scan completed: 0 critical, 1 high (false positive)" - 2 hrs ago
  - "Architecture violation detected: direct DB access in handler layer" - 3 hrs ago
  - Each item: icon, description, timestamp, action link

- "My Open PRs" table:
  - PR title, status (reviewing/approved/changes), AI findings count, review time, reviewer

RIGHT PANEL (40%):
- "AI Code Generation" quick panel:
  - "Describe what you want to build..." text area
  - Language selector, target directory
  - "Generate" button
  - Recent generations list

- "DORA Metrics" mini cards:
  - Deployment Frequency: 4.2/week
  - Lead Time: 2.3 days
  - Change Failure Rate: 3.2%
  - MTTR: 1.4 hours

Color: Dark theme (developer preference). Charcoal background, syntax-highlighting-inspired accents.
Code font: JetBrains Mono. UI font: Inter.
```

---

## Screen 2: AI Code Review Interface

### Figma Prompt

```
Design a code review interface showing AI-generated review findings on a PR.

HEADER:
- PR title: "feat: Add payment retry logic with exponential backoff"
- PR metadata: author avatar, branch, 4 files changed, +127/-23 lines
- AI review status: "Reviewed in 8 minutes" with green checkmark
- AI recommendation badge: "APPROVE" (green) or "REQUEST CHANGES" (red)
- Finding summary: "2 suggestions, 1 warning, 0 blockers"

LEFT PANEL (65%): Code Diff View
- File tabs: payment_handler.go | payment_service.go | payment_test.go | migration.sql
- Unified diff view with line numbers
- AI findings inline:
  - Yellow highlight on line with finding
  - Finding card attached to line:
    - Severity icon (warning triangle, info circle, blocker stop sign)
    - Category badge: "Performance" | "Bug" | "Security" | "Style" | "Architecture"
    - Finding message: "N+1 query detected: database call inside loop at line 47"
    - Explanation (expandable): "This loop queries the database for each payment..."
    - Suggested fix (code block with syntax highlighting):
      "Batch the queries using WHERE id IN (...) instead of individual lookups"
    - Actions: "Apply Fix" (one-click), "Dismiss" (with reason), "Discuss"
  - Green highlight for AI-approved changes (no findings)

RIGHT PANEL (35%): Review Summary
- Findings list (sortable by severity):
  - Each finding: severity icon, category, file:line, message (truncated)
  - Click to jump to finding in diff
- Architecture check results:
  - "Layer compliance: PASS" (green)
  - "Naming conventions: PASS" (green)
  - "Error handling: WARNING - unchecked error on line 52" (yellow)
- Test impact:
  - "Tests affected: 3 existing tests"
  - "Suggested new tests: 2 for payment retry logic"
  - "Generate Tests" button
- Dependency changes:
  - "No new dependencies added" (green)

BOTTOM BAR:
- "Approve" button (if 0 blockers)
- "Request Changes" button
- "Re-run AI Review" button
- "View Raw Diff" toggle
```

---

## Screen 3: Test Generation Workspace

### Figma Prompt

```
Design a test generation interface showing AI-generated tests with quality metrics.

LAYOUT (split view):

LEFT (50%): Source Code
- File tree showing project structure
- Selected function highlighted in source code viewer
- Function metadata: name, params, return type, complexity, current coverage

RIGHT (50%): Generated Tests
- Tab bar: "Generated Tests" | "Mutation Report" | "Coverage Map"

Generated Tests tab:
- Code editor (read-only initially, editable) showing generated test code
- Test cases listed:
  - TestPaymentRetry_Success (green check)
  - TestPaymentRetry_MaxRetriesExceeded (green check)
  - TestPaymentRetry_NilPayment (green check)
  - TestPaymentRetry_NetworkError (green check)
  - TestPaymentRetry_ConcurrentCalls (red X - needs fix)
- Action buttons: "Run Tests", "Apply to Project", "Regenerate", "Edit"

Mutation Report tab:
- Mutation score: 94% (34/36 mutants killed)
- Table of mutations:
  - Mutation type | Line | Status | Surviving mutant details
  - "Negate conditional" | 47 | Killed | -
  - "Remove return" | 52 | Killed | -
  - "Change operator > to >=" | 55 | SURVIVED | "Edge case: exactly max retries"
- "Generate additional test for surviving mutant" button

Coverage Map tab:
- Source code with line-by-line coverage highlighting
  - Green: covered by existing + generated tests
  - Yellow: covered only by generated tests (new coverage)
  - Red: still uncovered
- Coverage stats: Before: 47% -> After: 89% (+42%)
```

---

## Screen 4: Security Dashboard

### Figma Prompt

```
Design a security findings dashboard for the security scanning module.

TOP ROW - Summary:
- Critical: 2 (red, pulsing)
- High: 5 (orange)
- Medium: 12 (yellow)
- Low: 28 (gray)
- False Positive Rate: 7.3% (green, down from 73%)
- "AI-Verified True Positives" badge

MAIN TABLE:
Columns: Severity | Type | File | Line | Confidence | Status | Age | Actions
- Row: CRITICAL | SQL Injection | user_service.go | 142 | 0.94 | Open | 2 days | [Fix PR] [Dismiss]
- Row: HIGH | XSS | template.go | 88 | 0.87 | In Progress | 5 days | [View PR]
- Row: MEDIUM | Hardcoded Secret | config.go | 23 | 0.91 | Open | 1 day | [Fix PR]

Filters: Severity, Type (SAST/SCA/Secret), Status, File, Confidence threshold slider

DETAIL PANEL (when row clicked):
- Finding details with full explanation
- AI analysis: "This is a TRUE POSITIVE because..."
- Vulnerable code snippet with highlight
- Data flow trace showing how user input reaches the vulnerability
- Suggested remediation code diff
- "Generate Fix PR" button
- Similar past findings (resolved) for reference

DEPENDENCY VULNERABILITIES (separate tab):
- Table: Package | Version | CVE | Severity | Fix Available | Breaking Changes
- "Auto-upgrade safe dependencies" button
- "Generate upgrade PR" for each with breaking change analysis
```

---

## Screen 5: Tech Debt Dashboard

### Figma Prompt

```
Design a technical debt tracking dashboard.

TOP ROW - Overall Score:
- Large gauge/dial: Overall Debt Score 34/100 (Yellow)
- Trend chart (30 days): line chart showing score over time
- "Debt is decreasing at 2.1 points/month" label

COMPONENT BREAKDOWN (6 mini cards):
- Complexity: 28 (Green)
- Duplication: 42 (Yellow)
- Test Coverage: 38 (Yellow)
- Doc Currency: 52 (Orange)
- Dependencies: 18 (Green)
- Code Smells: 31 (Yellow)

MODULE HEATMAP (main visualization):
- Grid/treemap of modules/packages
- Size = lines of code
- Color = debt score (green to red gradient)
- Click module for detail
- Tooltip: module name, debt score, top issue, change frequency

PRIORITIZED REMEDIATION LIST:
- Table: Module | Debt Score | Bug Correlation | Change Frequency | Priority | Estimated Effort
- "payment-service" | 62 | High | 12 commits/mo | CRITICAL | 3 days
- "user-auth" | 48 | Medium | 8 commits/mo | HIGH | 2 days
- Actions: "View Details", "Create Jira Ticket", "Generate Refactoring PR"

TREND ANALYSIS:
- Debt added vs. debt repaid per sprint (bar chart, stacked)
- Debt velocity: are we gaining or losing ground?
```

---

## Screen 6: Semantic Code Search

### Figma Prompt

```
Design a semantic code search interface.

SEARCH BAR (top, prominent):
- "Search your codebase in natural language..."
- Examples: "find retry logic", "where do we validate email addresses", "payment error handling"
- Language filter: All | Go | TypeScript | Python
- Repo filter: current repo or all repos

RESULTS:
- Each result as a code card:
  - Function name, file path, language badge
  - Relevance score (dots or percentage)
  - Code snippet with syntax highlighting (3-5 relevant lines)
  - Context: callers count, tests count, complexity
  - Actions: "Open File", "View Dependencies", "Generate Tests"

- Grouping: results grouped by file or by relevance
- "Ask AI about these results" button at bottom

SIDEBAR (on result click):
- Full function source code
- Dependency graph mini-view (who calls this, what does it call)
- Related functions (semantically similar)
- Recent changes (git log for this function)
- "Generate documentation for this function" button
```

---

## Make.com Automation Prompts

### Automation 1: PR Review Pipeline
```
Create a Make.com scenario that:
1. Trigger: GitHub webhook for new Pull Request
2. Call Sovereign Dev API to trigger AI code review
3. Wait for review completion (polling with 30s interval)
4. If blockers found: post Slack message to team channel with summary
5. If no blockers: add "AI-Approved" label to PR
6. Log review metrics to Google Sheet for monthly reporting
```

### Automation 2: Security Alert Pipeline
```
Create a Make.com scenario that:
1. Trigger: Sovereign Dev webhook for new critical/high security finding
2. Create Jira ticket in Security backlog with finding details
3. Slack notify #security channel with finding summary
4. If AI confidence > 0.9: auto-generate fix PR via Sovereign Dev API
5. Email security team lead with weekly summary
```

### Automation 3: Tech Debt Weekly Report
```
Create a Make.com scenario that:
1. Trigger: Every Monday at 9 AM
2. Query Sovereign Dev API for tech debt scores across all repos
3. Compare to previous week
4. Generate HTML report with charts
5. Post to #engineering Slack channel
6. If any module score > 75: escalate to engineering manager
```

---

*Document Control: UI prompts iterated with design team and developer user testing.*
