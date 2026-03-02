import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Tag,
  Space,
  Statistic,
  Progress,
  Select,
  Tabs,
  List,
  Badge,
  Divider,
  Tooltip,
} from "antd";
import {
  SafetyCertificateOutlined,
  BugOutlined,
  WarningOutlined,
  CodeOutlined,
  FireOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

interface QualityIssue {
  id: string;
  file: string;
  line: number;
  rule: string;
  severity: "critical" | "major" | "minor" | "info";
  category: "bug" | "vulnerability" | "smell";
  message: string;
  effort: string;
}

interface Hotspot {
  file: string;
  issues: number;
  complexity: number;
  changes: number;
  lastModified: string;
  risk: "high" | "medium" | "low";
}

interface QualityGate {
  name: string;
  condition: string;
  threshold: string;
  actual: string;
  status: "passed" | "failed";
}

const qualityTrend = [
  { date: "Sep", score: 72, debt: 48, coverage: 68, duplication: 8.2 },
  { date: "Oct", score: 74, debt: 45, coverage: 71, duplication: 7.8 },
  { date: "Nov", score: 73, debt: 47, coverage: 70, duplication: 7.5 },
  { date: "Dec", score: 78, debt: 38, coverage: 74, duplication: 6.9 },
  { date: "Jan", score: 81, debt: 32, coverage: 77, duplication: 6.2 },
  { date: "Feb", score: 84, debt: 28, coverage: 79, duplication: 5.8 },
];

const demoIssues: QualityIssue[] = [
  { id: "Q001", file: "src/auth/session.ts", line: 45, rule: "no-unsafe-any", severity: "critical", category: "vulnerability", message: "Unsafe type assertion bypassing type checks", effort: "30m" },
  { id: "Q002", file: "src/billing/calculator.ts", line: 89, rule: "complexity", severity: "major", category: "smell", message: "Cyclomatic complexity of 18 exceeds threshold of 10", effort: "2h" },
  { id: "Q003", file: "src/agents/scheduler.ts", line: 23, rule: "no-floating-promises", severity: "critical", category: "bug", message: "Unhandled promise may cause silent failures", effort: "15m" },
  { id: "Q004", file: "src/api/routes.ts", line: 156, rule: "no-duplicate-imports", severity: "minor", category: "smell", message: "Duplicate import from same module", effort: "5m" },
  { id: "Q005", file: "src/webhooks/handler.ts", line: 67, rule: "no-hardcoded-credentials", severity: "critical", category: "vulnerability", message: "Potential hardcoded API key detected", effort: "20m" },
  { id: "Q006", file: "src/agents/pool.ts", line: 112, rule: "no-unused-vars", severity: "minor", category: "smell", message: "Variable 'retryCount' is assigned but never used", effort: "5m" },
  { id: "Q007", file: "src/billing/invoice.ts", line: 34, rule: "prefer-const", severity: "info", category: "smell", message: "Variable is never reassigned, use const", effort: "2m" },
  { id: "Q008", file: "src/api/middleware.ts", line: 78, rule: "no-eval", severity: "critical", category: "vulnerability", message: "Use of eval() detected - potential code injection", effort: "1h" },
  { id: "Q009", file: "src/agents/scheduler.ts", line: 145, rule: "max-lines", severity: "major", category: "smell", message: "File has 420 lines, exceeds maximum of 300", effort: "3h" },
  { id: "Q010", file: "src/webhooks/retry.ts", line: 56, rule: "no-magic-numbers", severity: "minor", category: "smell", message: "Magic number 5000 used for timeout", effort: "5m" },
  { id: "Q011", file: "src/auth/jwt.ts", line: 89, rule: "no-any", severity: "major", category: "bug", message: "Explicit 'any' type usage reduces type safety", effort: "20m" },
  { id: "Q012", file: "src/billing/calculator.ts", line: 200, rule: "cognitive-complexity", severity: "major", category: "smell", message: "Cognitive complexity of 22 exceeds threshold of 15", effort: "2h" },
];

const demoHotspots: Hotspot[] = [
  { file: "src/billing/calculator.ts", issues: 8, complexity: 42, changes: 34, lastModified: "2026-02-28", risk: "high" },
  { file: "src/agents/scheduler.ts", issues: 6, complexity: 38, changes: 28, lastModified: "2026-02-27", risk: "high" },
  { file: "src/auth/middleware.ts", issues: 5, complexity: 25, changes: 22, lastModified: "2026-02-27", risk: "high" },
  { file: "src/api/routes.ts", issues: 4, complexity: 20, changes: 45, lastModified: "2026-02-28", risk: "medium" },
  { file: "src/webhooks/handler.ts", issues: 3, complexity: 18, changes: 15, lastModified: "2026-02-26", risk: "medium" },
  { file: "src/agents/pool.ts", issues: 2, complexity: 15, changes: 12, lastModified: "2026-02-25", risk: "low" },
  { file: "src/auth/jwt.ts", issues: 2, complexity: 12, changes: 8, lastModified: "2026-02-24", risk: "low" },
];

const demoQualityGates: QualityGate[] = [
  { name: "Code Coverage", condition: "Coverage on new code", threshold: ">= 80%", actual: "79.2%", status: "failed" },
  { name: "Duplications", condition: "Duplication on new code", threshold: "<= 3%", actual: "2.1%", status: "passed" },
  { name: "Maintainability", condition: "Maintainability rating", threshold: ">= A", actual: "A", status: "passed" },
  { name: "Reliability", condition: "No new bugs", threshold: "0 new bugs", actual: "2 new bugs", status: "failed" },
  { name: "Security", condition: "No new vulnerabilities", threshold: "0 new vulns", actual: "0 new vulns", status: "passed" },
  { name: "Technical Debt", condition: "Debt ratio on new code", threshold: "<= 5%", actual: "3.8%", status: "passed" },
];

const currentScore = qualityTrend[qualityTrend.length - 1];

const CodeQuality: React.FC = () => {
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredIssues = demoIssues.filter((i) => {
    const matchSeverity = severityFilter === "all" || i.severity === severityFilter;
    const matchCategory = categoryFilter === "all" || i.category === categoryFilter;
    return matchSeverity && matchCategory;
  });

  const criticalCount = demoIssues.filter((i) => i.severity === "critical").length;
  const majorCount = demoIssues.filter((i) => i.severity === "major").length;
  const minorCount = demoIssues.filter((i) => i.severity === "minor").length;
  const infoCount = demoIssues.filter((i) => i.severity === "info").length;

  const severityColors: Record<string, string> = { critical: "red", major: "orange", minor: "gold", info: "blue" };
  const categoryColors: Record<string, string> = { bug: "red", vulnerability: "purple", smell: "orange" };
  const riskColors: Record<string, string> = { high: "red", medium: "orange", low: "green" };

  const issueColumns = [
    {
      title: "File",
      key: "file",
      render: (_: unknown, r: QualityIssue) => <Text code style={{ fontSize: 12 }}>{r.file}:{r.line}</Text>,
    },
    { title: "Rule", dataIndex: "rule", key: "rule", render: (v: string) => <Tag>{v}</Tag> },
    {
      title: "Severity",
      dataIndex: "severity",
      key: "severity",
      render: (s: string) => <Tag color={severityColors[s]}>{s.toUpperCase()}</Tag>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (c: string) => <Tag color={categoryColors[c]}>{c.toUpperCase()}</Tag>,
    },
    { title: "Message", dataIndex: "message", key: "message", ellipsis: true },
    { title: "Effort", dataIndex: "effort", key: "effort", width: 80 },
  ];

  const scoreColor = (score: number) => {
    if (score >= 80) return "#52c41a";
    if (score >= 60) return "#faad14";
    return "#ff4d4f";
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}><SafetyCertificateOutlined /> Code Quality</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6} md={4}>
          <Card size="small">
            <div style={{ textAlign: "center" }}>
              <Progress type="circle" percent={currentScore.score} size={80} strokeColor={scoreColor(currentScore.score)} format={(v) => <Text strong style={{ fontSize: 20 }}>{v}</Text>} />
              <div style={{ marginTop: 4 }}><Text type="secondary">Health Score</Text></div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Card size="small"><Statistic title="Tech Debt" value={currentScore.debt} suffix="hours" prefix={<ClockCircleOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Card size="small"><Statistic title="Coverage" value={currentScore.coverage} suffix="%" valueStyle={{ color: currentScore.coverage >= 80 ? "#52c41a" : "#faad14" }} /></Card>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Card size="small"><Statistic title="Duplication" value={currentScore.duplication} suffix="%" valueStyle={{ color: currentScore.duplication <= 5 ? "#52c41a" : "#faad14" }} /></Card>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Card size="small"><Statistic title="Critical Issues" value={criticalCount} valueStyle={{ color: "#ff4d4f" }} prefix={<FireOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Card size="small"><Statistic title="Total Issues" value={demoIssues.length} prefix={<BugOutlined />} /></Card>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="issues"
        items={[
          {
            key: "issues",
            label: `Issues (${demoIssues.length})`,
            children: (
              <Card>
                <Space style={{ marginBottom: 16 }}>
                  <Select value={severityFilter} onChange={setSeverityFilter} style={{ width: 150 }}>
                    <Option value="all">All Severities</Option>
                    <Option value="critical">Critical ({criticalCount})</Option>
                    <Option value="major">Major ({majorCount})</Option>
                    <Option value="minor">Minor ({minorCount})</Option>
                    <Option value="info">Info ({infoCount})</Option>
                  </Select>
                  <Select value={categoryFilter} onChange={setCategoryFilter} style={{ width: 150 }}>
                    <Option value="all">All Categories</Option>
                    <Option value="bug">Bugs</Option>
                    <Option value="vulnerability">Vulnerabilities</Option>
                    <Option value="smell">Code Smells</Option>
                  </Select>
                </Space>
                <Table columns={issueColumns} dataSource={filteredIssues} rowKey="id" size="small" pagination={{ pageSize: 10 }} />
              </Card>
            ),
          },
          {
            key: "trends",
            label: "Quality Trends",
            children: (
              <Card>
                <Row gutter={[16, 16]}>
                  {qualityTrend.map((item, idx) => {
                    const prev = idx > 0 ? qualityTrend[idx - 1] : item;
                    const scoreChange = item.score - prev.score;
                    return (
                      <Col xs={12} sm={8} md={4} key={item.date}>
                        <Card size="small">
                          <Text strong style={{ display: "block", marginBottom: 8 }}>{item.date}</Text>
                          <Space orientation="vertical" size={4} style={{ width: "100%" }}>
                            <div>
                              <Text type="secondary">Score: </Text>
                              <Text strong style={{ color: scoreColor(item.score) }}>{item.score}</Text>
                              {idx > 0 && (
                                <Text style={{ color: scoreChange >= 0 ? "#52c41a" : "#ff4d4f", fontSize: 11, marginLeft: 4 }}>
                                  {scoreChange >= 0 ? <RiseOutlined /> : <FallOutlined />}{Math.abs(scoreChange)}
                                </Text>
                              )}
                            </div>
                            <div><Text type="secondary">Debt: </Text><Text>{item.debt}h</Text></div>
                            <div><Text type="secondary">Coverage: </Text><Text>{item.coverage}%</Text></div>
                            <div><Text type="secondary">Duplication: </Text><Text>{item.duplication}%</Text></div>
                          </Space>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </Card>
            ),
          },
          {
            key: "hotspots",
            label: "Hotspots",
            children: (
              <Card>
                <Table
                  dataSource={demoHotspots}
                  rowKey="file"
                  size="small"
                  pagination={false}
                  columns={[
                    { title: "File", dataIndex: "file", key: "file", render: (f: string) => <Text code style={{ fontSize: 12 }}>{f}</Text> },
                    { title: "Issues", dataIndex: "issues", key: "issues", sorter: (a: Hotspot, b: Hotspot) => a.issues - b.issues },
                    { title: "Complexity", dataIndex: "complexity", key: "complexity", sorter: (a: Hotspot, b: Hotspot) => a.complexity - b.complexity },
                    { title: "Changes (30d)", dataIndex: "changes", key: "changes", sorter: (a: Hotspot, b: Hotspot) => a.changes - b.changes },
                    { title: "Last Modified", dataIndex: "lastModified", key: "lastModified" },
                    {
                      title: "Risk",
                      dataIndex: "risk",
                      key: "risk",
                      render: (r: string) => <Tag color={riskColors[r]}>{r.toUpperCase()}</Tag>,
                    },
                  ]}
                />
              </Card>
            ),
          },
          {
            key: "gates",
            label: "Quality Gates",
            children: (
              <Card>
                <List
                  dataSource={demoQualityGates}
                  renderItem={(gate) => (
                    <List.Item
                      extra={
                        gate.status === "passed"
                          ? <Tag color="success" icon={<CheckCircleOutlined />}>PASSED</Tag>
                          : <Tag color="error" icon={<CloseCircleOutlined />}>FAILED</Tag>
                      }
                    >
                      <List.Item.Meta
                        title={gate.name}
                        description={
                          <Space>
                            <Text type="secondary">{gate.condition}</Text>
                            <Text type="secondary">|</Text>
                            <Text type="secondary">Threshold: {gate.threshold}</Text>
                            <Text type="secondary">|</Text>
                            <Text style={{ color: gate.status === "passed" ? "#52c41a" : "#ff4d4f" }}>Actual: {gate.actual}</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

export default CodeQuality;
