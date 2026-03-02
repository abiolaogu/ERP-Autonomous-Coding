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
  Alert,
  Timeline,
} from "antd";
import {
  SafetyCertificateOutlined,
  BugOutlined,
  WarningOutlined,
  LockOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  CodeOutlined,
  FileSearchOutlined,
  KeyOutlined,
  HistoryOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

interface Vulnerability {
  id: string;
  package: string;
  cveId: string;
  severity: "critical" | "high" | "medium" | "low";
  cvssScore: number;
  fixAvailable: boolean;
  fixVersion: string;
  status: "open" | "in-progress" | "fixed" | "accepted";
  description: string;
}

interface SecretFinding {
  id: string;
  file: string;
  line: number;
  type: "api-key" | "password" | "token" | "certificate";
  status: "active" | "revoked" | "false-positive";
  detectedAt: string;
}

interface SASTFinding {
  id: string;
  file: string;
  line: number;
  rule: string;
  severity: "critical" | "high" | "medium" | "low";
  category: string;
  message: string;
  cwe: string;
}

interface ScanHistory {
  id: string;
  date: string;
  type: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
  newFindings: number;
  fixedFindings: number;
}

const demoVulnerabilities: Vulnerability[] = [
  { id: "V001", package: "lodash@4.17.20", cveId: "CVE-2024-28849", severity: "critical", cvssScore: 9.8, fixAvailable: true, fixVersion: "4.17.21", status: "open", description: "Prototype pollution via the set function" },
  { id: "V002", package: "jsonwebtoken@8.5.1", cveId: "CVE-2024-33883", severity: "high", cvssScore: 7.5, fixAvailable: true, fixVersion: "9.0.0", status: "in-progress", description: "JWT algorithm confusion vulnerability" },
  { id: "V003", package: "express@4.18.2", cveId: "CVE-2025-12345", severity: "medium", cvssScore: 5.3, fixAvailable: true, fixVersion: "4.19.0", status: "open", description: "Path traversal in static file serving" },
  { id: "V004", package: "axios@1.4.0", cveId: "CVE-2025-23456", severity: "high", cvssScore: 7.1, fixAvailable: true, fixVersion: "1.6.0", status: "fixed", description: "SSRF via crafted URL" },
  { id: "V005", package: "pg@8.11.0", cveId: "CVE-2025-34567", severity: "medium", cvssScore: 6.1, fixAvailable: false, fixVersion: "-", status: "accepted", description: "SQL injection in dynamic query building" },
  { id: "V006", package: "tar@6.1.11", cveId: "CVE-2024-45678", severity: "high", cvssScore: 7.8, fixAvailable: true, fixVersion: "6.2.0", status: "open", description: "Arbitrary file write via symlink" },
  { id: "V007", package: "minimatch@3.0.4", cveId: "CVE-2024-56789", severity: "low", cvssScore: 3.7, fixAvailable: true, fixVersion: "3.1.2", status: "open", description: "ReDoS via crafted glob pattern" },
  { id: "V008", package: "semver@7.3.7", cveId: "CVE-2024-67890", severity: "medium", cvssScore: 5.5, fixAvailable: true, fixVersion: "7.5.2", status: "open", description: "ReDoS in range parsing" },
  { id: "V009", package: "node-fetch@2.6.7", cveId: "CVE-2025-78901", severity: "critical", cvssScore: 9.1, fixAvailable: true, fixVersion: "3.3.0", status: "open", description: "Exposure of sensitive information to unauthorized actors" },
  { id: "V010", package: "helmet@6.0.0", cveId: "CVE-2025-89012", severity: "low", cvssScore: 2.4, fixAvailable: true, fixVersion: "7.0.0", status: "open", description: "Misconfigured CSP header defaults" },
];

const demoSecrets: SecretFinding[] = [
  { id: "S001", file: "src/config/database.ts", line: 12, type: "password", status: "active", detectedAt: "2026-02-28 09:15" },
  { id: "S002", file: "src/services/stripe.ts", line: 5, type: "api-key", status: "revoked", detectedAt: "2026-02-27 14:30" },
  { id: "S003", file: "tests/fixtures/auth.ts", line: 8, type: "token", status: "false-positive", detectedAt: "2026-02-26 11:00" },
  { id: "S004", file: ".env.example", line: 3, type: "api-key", status: "false-positive", detectedAt: "2026-02-25 16:45" },
  { id: "S005", file: "src/integrations/aws.ts", line: 15, type: "api-key", status: "active", detectedAt: "2026-02-28 10:00" },
  { id: "S006", file: "deploy/docker-compose.yml", line: 22, type: "password", status: "active", detectedAt: "2026-02-24 08:20" },
  { id: "S007", file: "src/auth/oauth.ts", line: 34, type: "token", status: "revoked", detectedAt: "2026-02-23 12:30" },
];

const demoSAST: SASTFinding[] = [
  { id: "SA001", file: "src/api/graphql.ts", line: 45, rule: "no-sql-injection", severity: "critical", category: "Injection", message: "User input directly used in SQL query", cwe: "CWE-89" },
  { id: "SA002", file: "src/auth/middleware.ts", line: 23, rule: "no-eval", severity: "critical", category: "Code Injection", message: "Dynamic code execution via eval()", cwe: "CWE-94" },
  { id: "SA003", file: "src/api/upload.ts", line: 67, rule: "path-traversal", severity: "high", category: "Path Traversal", message: "Unsanitized file path in file upload handler", cwe: "CWE-22" },
  { id: "SA004", file: "src/auth/session.ts", line: 89, rule: "insecure-cookie", severity: "medium", category: "Session Management", message: "Session cookie missing secure flag", cwe: "CWE-614" },
  { id: "SA005", file: "src/api/routes.ts", line: 112, rule: "no-cors-wildcard", severity: "medium", category: "CORS", message: "CORS allows all origins with credentials", cwe: "CWE-942" },
  { id: "SA006", file: "src/utils/crypto.ts", line: 34, rule: "weak-crypto", severity: "high", category: "Cryptography", message: "MD5 used for password hashing", cwe: "CWE-328" },
];

const demoScanHistory: ScanHistory[] = [
  { id: "H001", date: "2026-02-28", type: "Full Scan", critical: 2, high: 3, medium: 3, low: 2, total: 10, newFindings: 1, fixedFindings: 2 },
  { id: "H002", date: "2026-02-21", type: "Full Scan", critical: 3, high: 4, medium: 3, low: 2, total: 12, newFindings: 0, fixedFindings: 1 },
  { id: "H003", date: "2026-02-14", type: "Full Scan", critical: 3, high: 4, medium: 4, low: 2, total: 13, newFindings: 2, fixedFindings: 0 },
  { id: "H004", date: "2026-02-07", type: "Full Scan", critical: 2, high: 3, medium: 3, low: 3, total: 11, newFindings: 3, fixedFindings: 4 },
  { id: "H005", date: "2026-01-31", type: "Full Scan", critical: 3, high: 4, medium: 3, low: 2, total: 12, newFindings: 1, fixedFindings: 2 },
];

const SecurityScanner: React.FC = () => {
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredVulns = demoVulnerabilities.filter((v) => {
    const matchSev = severityFilter === "all" || v.severity === severityFilter;
    const matchStatus = statusFilter === "all" || v.status === statusFilter;
    return matchSev && matchStatus;
  });

  const criticalCount = demoVulnerabilities.filter((v) => v.severity === "critical" && v.status !== "fixed").length;
  const highCount = demoVulnerabilities.filter((v) => v.severity === "high" && v.status !== "fixed").length;
  const mediumCount = demoVulnerabilities.filter((v) => v.severity === "medium" && v.status !== "fixed").length;
  const lowCount = demoVulnerabilities.filter((v) => v.severity === "low" && v.status !== "fixed").length;
  const totalOpen = criticalCount + highCount + mediumCount + lowCount;
  const activeSecrets = demoSecrets.filter((s) => s.status === "active").length;

  const severityColors: Record<string, string> = { critical: "red", high: "orange", medium: "gold", low: "blue" };
  const statusColors: Record<string, string> = { open: "warning", "in-progress": "processing", fixed: "success", accepted: "default" };
  const secretTypeIcons: Record<string, React.ReactNode> = { "api-key": <KeyOutlined />, password: <LockOutlined />, token: <SafetyCertificateOutlined />, certificate: <FileSearchOutlined /> };
  const secretStatusColors: Record<string, string> = { active: "error", revoked: "success", "false-positive": "default" };

  const vulnColumns = [
    { title: "Package", dataIndex: "package", key: "package", render: (p: string) => <Text code>{p}</Text> },
    { title: "CVE", dataIndex: "cveId", key: "cveId" },
    { title: "Severity", dataIndex: "severity", key: "severity", render: (s: string) => <Tag color={severityColors[s]}>{s.toUpperCase()}</Tag> },
    { title: "CVSS", dataIndex: "cvssScore", key: "cvssScore", render: (v: number) => <Text strong style={{ color: v >= 9 ? "#ff4d4f" : v >= 7 ? "#fa8c16" : v >= 4 ? "#faad14" : "#1890ff" }}>{v}</Text> },
    { title: "Fix", dataIndex: "fixAvailable", key: "fix", render: (f: boolean, r: Vulnerability) => f ? <Tag color="success">{r.fixVersion}</Tag> : <Tag color="default">No fix</Tag> },
    { title: "Status", dataIndex: "status", key: "status", render: (s: string) => <Tag color={statusColors[s]}>{s.toUpperCase()}</Tag> },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}><SafetyCertificateOutlined /> Security Scanner</Title>

      {criticalCount > 0 && (
        <Alert title={`${criticalCount} critical vulnerabilities require immediate attention`} type="error" showIcon style={{ marginBottom: 16 }} />
      )}
      {activeSecrets > 0 && (
        <Alert title={`${activeSecrets} active secrets detected in source code`} type="warning" showIcon style={{ marginBottom: 16 }} />
      )}

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="Total Findings" value={totalOpen} prefix={<BugOutlined />} /></Card></Col>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="Critical" value={criticalCount} valueStyle={{ color: "#ff4d4f" }} prefix={<ExclamationCircleOutlined />} /></Card></Col>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="High" value={highCount} valueStyle={{ color: "#fa8c16" }} prefix={<WarningOutlined />} /></Card></Col>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="Medium" value={mediumCount} valueStyle={{ color: "#faad14" }} /></Card></Col>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="Low" value={lowCount} valueStyle={{ color: "#1890ff" }} /></Card></Col>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="Active Secrets" value={activeSecrets} valueStyle={{ color: "#ff4d4f" }} prefix={<KeyOutlined />} /></Card></Col>
      </Row>

      <Tabs
        defaultActiveKey="vulns"
        items={[
          {
            key: "vulns",
            label: `Vulnerabilities (${totalOpen})`,
            children: (
              <Card>
                <Space style={{ marginBottom: 16 }}>
                  <Select value={severityFilter} onChange={setSeverityFilter} style={{ width: 150 }}>
                    <Option value="all">All Severities</Option>
                    <Option value="critical">Critical</Option>
                    <Option value="high">High</Option>
                    <Option value="medium">Medium</Option>
                    <Option value="low">Low</Option>
                  </Select>
                  <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 150 }}>
                    <Option value="all">All Statuses</Option>
                    <Option value="open">Open</Option>
                    <Option value="in-progress">In Progress</Option>
                    <Option value="fixed">Fixed</Option>
                    <Option value="accepted">Accepted</Option>
                  </Select>
                </Space>
                <Table columns={vulnColumns} dataSource={filteredVulns} rowKey="id" size="small" pagination={{ pageSize: 8 }}
                  expandable={{ expandedRowRender: (record) => <Text>{record.description}</Text> }}
                />
              </Card>
            ),
          },
          {
            key: "secrets",
            label: (
              <Badge count={activeSecrets} size="small" offset={[8, 0]}>
                <span><KeyOutlined /> Secret Detection</span>
              </Badge>
            ),
            children: (
              <Card>
                <Table
                  dataSource={demoSecrets}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  columns={[
                    { title: "File", dataIndex: "file", key: "file", render: (f: string) => <Text code style={{ fontSize: 12 }}>{f}</Text> },
                    { title: "Line", dataIndex: "line", key: "line" },
                    { title: "Type", dataIndex: "type", key: "type", render: (t: string) => <Tag icon={secretTypeIcons[t]}>{t.toUpperCase()}</Tag> },
                    { title: "Status", dataIndex: "status", key: "status", render: (s: string) => <Tag color={secretStatusColors[s]}>{s.toUpperCase()}</Tag> },
                    { title: "Detected", dataIndex: "detectedAt", key: "detectedAt" },
                  ]}
                />
              </Card>
            ),
          },
          {
            key: "sast",
            label: `SAST (${demoSAST.length})`,
            children: (
              <Card>
                <Table
                  dataSource={demoSAST}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  columns={[
                    { title: "File", key: "file", render: (_: unknown, r: SASTFinding) => <Text code style={{ fontSize: 12 }}>{r.file}:{r.line}</Text> },
                    { title: "Rule", dataIndex: "rule", key: "rule", render: (v: string) => <Tag>{v}</Tag> },
                    { title: "Severity", dataIndex: "severity", key: "severity", render: (s: string) => <Tag color={severityColors[s]}>{s.toUpperCase()}</Tag> },
                    { title: "Category", dataIndex: "category", key: "category" },
                    { title: "CWE", dataIndex: "cwe", key: "cwe" },
                    { title: "Message", dataIndex: "message", key: "message", ellipsis: true },
                  ]}
                />
              </Card>
            ),
          },
          {
            key: "history",
            label: <span><HistoryOutlined /> Scan History</span>,
            children: (
              <Card>
                <Table
                  dataSource={demoScanHistory}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  columns={[
                    { title: "Date", dataIndex: "date", key: "date" },
                    { title: "Type", dataIndex: "type", key: "type" },
                    { title: "Critical", dataIndex: "critical", key: "critical", render: (v: number) => <Tag color={v > 0 ? "red" : "default"}>{v}</Tag> },
                    { title: "High", dataIndex: "high", key: "high", render: (v: number) => <Tag color={v > 0 ? "orange" : "default"}>{v}</Tag> },
                    { title: "Medium", dataIndex: "medium", key: "medium", render: (v: number) => <Tag color={v > 0 ? "gold" : "default"}>{v}</Tag> },
                    { title: "Low", dataIndex: "low", key: "low", render: (v: number) => <Tag color="blue">{v}</Tag> },
                    { title: "Total", dataIndex: "total", key: "total", render: (v: number) => <Text strong>{v}</Text> },
                    { title: "New", dataIndex: "newFindings", key: "new", render: (v: number) => v > 0 ? <Tag color="error">+{v}</Tag> : <Tag>0</Tag> },
                    { title: "Fixed", dataIndex: "fixedFindings", key: "fixed", render: (v: number) => v > 0 ? <Tag color="success">-{v}</Tag> : <Tag>0</Tag> },
                  ]}
                />
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

export default SecurityScanner;
