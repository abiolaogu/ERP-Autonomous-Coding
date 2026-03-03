# Figma Make Prompts: PRD to UX Flows -- Sovereign Code

**Module:** ERP-Autonomous-Coding | **Port:** 5182 | **Version:** 3.0 | **Date:** 2026-03-03

---

## 1. IDE-Like Web Interface

**Figma Prompt:**
```
Design a web-based code intelligence dashboard with an IDE-inspired layout. Three-panel layout:

Left panel (280px): Repository explorer
- Tree view of connected repositories
- Each repo: name, language icon, index status badge (green/yellow/red)
- Expand to see file tree
- Search bar at top for file search

Center panel (flex): Main content area. Tab-based navigation:
- Code Editor tab: Monaco Editor with AI suggestions panel on right (collapsible, 320px)
- Reviews tab: PR review list and detail view
- Tests tab: Test generation interface
- Security tab: Vulnerability scanner dashboard
- Debt tab: Technical debt board

Right panel (320px, collapsible): Context panel
- Knowledge graph mini-view (interactive D3.js visualization)
- Related files list
- AI suggestions panel (when in editor)
- Architecture compliance status

Top navigation: Breadcrumb (Repo > File path), search bar (semantic code search), user avatar, settings.
```

## 2. AI Suggestions Panel

**Figma Prompt:**
```
Design an AI suggestions panel that appears alongside the code editor.

Panel width: 320px, right side of editor. Background: #FAFAFA.

Sections:
1. "AI Suggestions" header with suggestion count badge
2. Each suggestion card:
   - Category icon + label (Bug/Security/Performance/Style)
   - Severity badge (Critical=red, High=orange, Medium=yellow, Low=blue)
   - Title (1 line, bold)
   - Description (2-3 lines)
   - Code diff preview (collapsible, syntax highlighted)
   - "Apply Fix" button (green), "Dismiss" button (gray), "Explain" button (outline)
   - Confidence percentage

3. Bottom section: "Generate Tests" button, "Document This" button

Interaction: Clicking a suggestion highlights the relevant code lines in the editor with a yellow background. Applying a fix shows an inline diff preview before confirming.
```

## 3. PR Review Dashboard

**Figma Prompt:**
```
Design a pull request review dashboard.

List view: Table with columns:
- PR number + title (linked)
- Author (avatar + name)
- Repository
- Status badges: AI Review Score (0-100 with color), Risk Level (Low/Med/High/Critical chip)
- Stats: files changed, lines +/-, suggestions count
- Time since created (relative)

Detail view (full page):
- Header: PR title, author, branch info, overall score gauge (0-100)
- Summary card: AI-generated summary of what changed and why
- Risk assessment: impact analysis from knowledge graph
- Tab sections:
  - Files Changed: diff viewer with inline AI comments (Monaco diff editor)
  - Suggestions: list of all AI suggestions, filterable by category/severity
  - Security: vulnerability findings specific to this PR
  - Tests: coverage impact, suggested tests
  - Architecture: compliance check results

AI comment format in diff viewer:
- Yellow highlight on relevant lines
- Comment bubble: category icon, severity, description, suggested fix as code diff
- Action buttons: "Apply", "Dismiss", "Reply"
```

## 4. Vulnerability Scanner Dashboard

**Figma Prompt:**
```
Design a security vulnerability dashboard.

Top stats bar:
- Total vulnerabilities (with severity breakdown donut chart)
- Critical count (red), High (orange), Medium (yellow), Low (blue)
- Trend sparkline (last 30 days)
- "Run Full Scan" button

Filters: Repository selector, severity filter, scan type (SAST/Dependency/Secrets/Config), status (Open/Acknowledged/Fixed)

Vulnerability list: Card layout
Each card:
- Severity badge (large, color-coded)
- Title + vulnerability ID (CVE if applicable)
- File path + line number (clickable, opens editor)
- Description (2 lines, expandable)
- "Suggested Fix" collapsible section with code diff
- Status dropdown: Open, Acknowledged, Fixed, False Positive
- "Create Fix PR" button (auto-generates fix)
- Detection date, scan type badge

Detail view:
- Full vulnerability description
- CWE and OWASP category tags
- Affected code with highlighted vulnerable lines
- Suggested fix with full diff
- References (links to CWE, OWASP, advisory)
- Fix history (if previously fixed and regressed)
```

## 5. Technical Debt Board

**Figma Prompt:**
```
Design a technical debt management board inspired by Jira/Linear.

Top section:
- Overall debt score: Large number (0-100) with color indicator and trend arrow
- Breakdown donut chart: Complexity, Duplication, Coverage, Dependencies, Architecture, Documentation
- "Auto-Fix Easy Wins" button (generates PRs for simple fixes)

Board view (Kanban):
Columns: Open | In Progress | Fixed | Accepted (won't fix)

Each card:
- Category icon (wrench for complexity, copy for duplication, shield for security, etc.)
- Title (1 line)
- File path (truncated)
- Debt score contribution
- Estimated effort (hours badge)
- Priority badge (Critical/High/Medium/Low)
- "Auto-fixable" badge (if applicable)
- Assignee avatar

List view (alternative): Sortable table with all debt items

Trend chart: Line graph showing debt score over last 6 months with release markers

Filter bar: Repository, category, priority, auto-fixable only
```

## 6. Architecture Visualizer

**Figma Prompt:**
```
Design an interactive architecture visualization powered by the codebase knowledge graph.

Main view: D3.js force-directed graph
- Nodes: Modules/packages (circles, sized by file count, colored by language)
- Edges: Dependencies (arrows, thickness by coupling strength)
- Cluster by layer (presentation, business logic, data access, infrastructure)
- Red edges for architecture violations (layer violations, circular dependencies)

Interactions:
- Click node: Expand to show internal files/functions
- Hover node: Show metadata tooltip (file count, complexity score, test coverage %)
- Right-click: "View files", "Show tests", "Find violations"
- Filter panel: Show/hide layers, filter by language, highlight violations only

Rule violations sidebar:
- List of architecture rule violations with descriptions
- Each violation: rule name, violating file, expected layer, actual layer
- "Create Rule" button for adding new architecture constraints

Bottom panel: Dependency graph (tree view showing package dependencies with version and CVE counts)
```

## 7. Settings and Configuration

**Figma Prompt:**
```
Design a settings page with tabs: General | Repositories | Rules | Team | Integrations.

General:
- AI model selection (Cloud/Self-Hosted toggle)
- Completion behavior (auto-suggest on/off, delay slider)
- Review auto-trigger (on PR creation toggle)
- Test framework preferences per language
- Notification preferences

Repositories:
- Connected repos list with index status and last sync
- "Connect Repository" button (OAuth flow)
- Per-repo settings: default branch, language overrides, ignore patterns

Rules:
- Architecture rules editor (form: name, type, definition, severity)
- Style rules (link to .editorconfig/.eslintrc)
- Custom review rules (define patterns to always flag)
- Security exception list (acknowledged false positives)

Team:
- Team members with role (admin/developer/viewer)
- SSO configuration
- API key management

Integrations:
- GitHub/GitLab/Bitbucket connection status
- CI/CD integration setup (GitHub Actions, GitLab CI, Jenkins)
- Slack/Teams notification configuration
- Jira/Linear ticket integration
```

---

*Confidential. Sovereign Code. All rights reserved.*
