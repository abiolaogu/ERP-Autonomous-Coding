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
  Divider,
  Steps,
  Badge,
  Tooltip,
} from "antd";
import {
  DeploymentUnitOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  StopOutlined,
  ThunderboltOutlined,
  RiseOutlined,
  FallOutlined,
  BugOutlined,
  WarningOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

interface PipelineRun {
  id: string;
  name: string;
  trigger: string;
  started: string;
  duration: string;
  status: "success" | "failed" | "running" | "cancelled";
  stages: { name: string; status: "success" | "failed" | "running" | "pending" | "skipped"; duration: string }[];
  branch: string;
  commit: string;
}

interface FailureReason {
  reason: string;
  count: number;
  percentage: number;
  trend: "up" | "down" | "stable";
}

interface FlakyTest {
  name: string;
  file: string;
  failRate: number;
  totalRuns: number;
  lastFailed: string;
}

const demoRuns: PipelineRun[] = [
  {
    id: "R001", name: "erp-platform/main", trigger: "push", started: "2026-02-28 12:05", duration: "8m 42s", status: "success", branch: "main", commit: "a3f2c1d",
    stages: [
      { name: "Checkout", status: "success", duration: "12s" },
      { name: "Build", status: "success", duration: "2m 15s" },
      { name: "Lint", status: "success", duration: "45s" },
      { name: "Test", status: "success", duration: "3m 20s" },
      { name: "Deploy", status: "success", duration: "2m 10s" },
    ],
  },
  {
    id: "R002", name: "erp-agents/feature-pool", trigger: "push", started: "2026-02-28 11:30", duration: "6m 18s", status: "failed", branch: "feature/agent-pool", commit: "b4e5f2a",
    stages: [
      { name: "Checkout", status: "success", duration: "10s" },
      { name: "Build", status: "success", duration: "1m 50s" },
      { name: "Lint", status: "success", duration: "38s" },
      { name: "Test", status: "failed", duration: "3m 40s" },
      { name: "Deploy", status: "skipped", duration: "-" },
    ],
  },
  {
    id: "R003", name: "erp-billing/main", trigger: "schedule", started: "2026-02-28 06:00", duration: "12m 05s", status: "success", branch: "main", commit: "c7d8e9f",
    stages: [
      { name: "Checkout", status: "success", duration: "15s" },
      { name: "Build", status: "success", duration: "3m 10s" },
      { name: "Lint", status: "success", duration: "1m 05s" },
      { name: "Test", status: "success", duration: "5m 25s" },
      { name: "Deploy", status: "success", duration: "2m 10s" },
    ],
  },
  {
    id: "R004", name: "erp-gateway/hotfix", trigger: "push", started: "2026-02-28 10:15", duration: "--", status: "running", branch: "hotfix/cors", commit: "d1a2b3c",
    stages: [
      { name: "Checkout", status: "success", duration: "8s" },
      { name: "Build", status: "success", duration: "1m 20s" },
      { name: "Lint", status: "running", duration: "--" },
      { name: "Test", status: "pending", duration: "--" },
      { name: "Deploy", status: "pending", duration: "--" },
    ],
  },
  {
    id: "R005", name: "erp-webhooks/main", trigger: "push", started: "2026-02-28 09:45", duration: "4m 32s", status: "cancelled", branch: "main", commit: "e4f5a6b",
    stages: [
      { name: "Checkout", status: "success", duration: "11s" },
      { name: "Build", status: "success", duration: "2m 05s" },
      { name: "Lint", status: "skipped", duration: "-" },
      { name: "Test", status: "skipped", duration: "-" },
      { name: "Deploy", status: "skipped", duration: "-" },
    ],
  },
  {
    id: "R006", name: "erp-platform/feature-tenant", trigger: "pull_request", started: "2026-02-28 09:00", duration: "9m 55s", status: "success", branch: "feature/multi-tenant", commit: "f7a8b9c",
    stages: [
      { name: "Checkout", status: "success", duration: "12s" },
      { name: "Build", status: "success", duration: "2m 30s" },
      { name: "Lint", status: "success", duration: "50s" },
      { name: "Test", status: "success", duration: "4m 15s" },
      { name: "Deploy", status: "success", duration: "2m 08s" },
    ],
  },
  {
    id: "R007", name: "erp-agents/main", trigger: "push", started: "2026-02-27 18:30", duration: "7m 10s", status: "failed", branch: "main", commit: "a1b2c3d",
    stages: [
      { name: "Checkout", status: "success", duration: "9s" },
      { name: "Build", status: "failed", duration: "2m 45s" },
      { name: "Lint", status: "skipped", duration: "-" },
      { name: "Test", status: "skipped", duration: "-" },
      { name: "Deploy", status: "skipped", duration: "-" },
    ],
  },
  {
    id: "R008", name: "erp-docs/main", trigger: "push", started: "2026-02-27 16:15", duration: "3m 22s", status: "success", branch: "main", commit: "b4c5d6e",
    stages: [
      { name: "Checkout", status: "success", duration: "8s" },
      { name: "Build", status: "success", duration: "1m 45s" },
      { name: "Lint", status: "success", duration: "22s" },
      { name: "Test", status: "success", duration: "42s" },
      { name: "Deploy", status: "success", duration: "25s" },
    ],
  },
];

const failureReasons: FailureReason[] = [
  { reason: "Test failures", count: 28, percentage: 38, trend: "down" },
  { reason: "Build compilation errors", count: 15, percentage: 21, trend: "stable" },
  { reason: "Timeout exceeded", count: 10, percentage: 14, trend: "up" },
  { reason: "Dependency resolution failure", count: 8, percentage: 11, trend: "down" },
  { reason: "Infrastructure issues", count: 6, percentage: 8, trend: "stable" },
  { reason: "Configuration errors", count: 5, percentage: 7, trend: "down" },
];

const flakyTests: FlakyTest[] = [
  { name: "should handle concurrent agent requests", file: "agents/pool.test.ts", failRate: 18, totalRuns: 50, lastFailed: "2026-02-28 11:30" },
  { name: "should process webhook with retry", file: "webhooks/retry.test.ts", failRate: 12, totalRuns: 42, lastFailed: "2026-02-27 14:20" },
  { name: "should calculate billing with timezone", file: "billing/calc.test.ts", failRate: 8, totalRuns: 60, lastFailed: "2026-02-26 06:00" },
  { name: "should authenticate via SSO redirect", file: "auth/sso.test.ts", failRate: 6, totalRuns: 35, lastFailed: "2026-02-25 09:45" },
];

const slowestPipelines = [
  { name: "erp-billing/main", avgDuration: "12m 05s", p95: "15m 20s", runs: 45 },
  { name: "erp-platform/feature-tenant", avgDuration: "9m 55s", p95: "12m 40s", runs: 28 },
  { name: "erp-platform/main", avgDuration: "8m 42s", p95: "11m 15s", runs: 120 },
  { name: "erp-agents/main", avgDuration: "7m 10s", p95: "9m 30s", runs: 85 },
  { name: "erp-gateway/main", avgDuration: "5m 18s", p95: "7m 05s", runs: 62 },
];

const successRateTrend = [
  { week: "W5", rate: 82, total: 45 },
  { week: "W6", rate: 85, total: 52 },
  { week: "W7", rate: 88, total: 48 },
  { week: "W8", rate: 84, total: 56 },
  { week: "W9", rate: 91, total: 50 },
];

const PipelineInsights: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredRuns = demoRuns.filter((r) => statusFilter === "all" || r.status === statusFilter);

  const successCount = demoRuns.filter((r) => r.status === "success").length;
  const failedCount = demoRuns.filter((r) => r.status === "failed").length;
  const runningCount = demoRuns.filter((r) => r.status === "running").length;
  const successRate = Math.round((successCount / demoRuns.length) * 100);

  const statusColors: Record<string, string> = { success: "success", failed: "error", running: "processing", cancelled: "default" };
  const statusIcons: Record<string, React.ReactNode> = { success: <CheckCircleOutlined />, failed: <CloseCircleOutlined />, running: <SyncOutlined spin />, cancelled: <StopOutlined /> };
  const stageStatusColors: Record<string, string> = { success: "#52c41a", failed: "#ff4d4f", running: "#1890ff", pending: "#d9d9d9", skipped: "#bfbfbf" };

  const columns = [
    {
      title: "Pipeline",
      key: "name",
      render: (_: unknown, r: PipelineRun) => (
        <Space orientation="vertical" size={0}>
          <Text strong>{r.name}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{r.branch} @ {r.commit}</Text>
        </Space>
      ),
    },
    { title: "Trigger", dataIndex: "trigger", key: "trigger", render: (t: string) => <Tag>{t}</Tag> },
    { title: "Started", dataIndex: "started", key: "started" },
    { title: "Duration", dataIndex: "duration", key: "duration" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: string) => <Tag color={statusColors[s]} icon={statusIcons[s]}>{s.toUpperCase()}</Tag>,
    },
    {
      title: "Stages",
      key: "stages",
      width: 250,
      render: (_: unknown, r: PipelineRun) => (
        <Space size={4}>
          {r.stages.map((stage, idx) => (
            <Tooltip key={idx} title={`${stage.name}: ${stage.status} (${stage.duration})`}>
              <div style={{ width: 40, height: 8, borderRadius: 4, backgroundColor: stageStatusColors[stage.status] }} />
            </Tooltip>
          ))}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}><DeploymentUnitOutlined /> Pipeline Insights</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="Total Runs" value={demoRuns.length} prefix={<DeploymentUnitOutlined />} /></Card></Col>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="Success Rate" value={successRate} suffix="%" valueStyle={{ color: successRate >= 85 ? "#52c41a" : "#faad14" }} /></Card></Col>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="Succeeded" value={successCount} valueStyle={{ color: "#52c41a" }} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="Failed" value={failedCount} valueStyle={{ color: "#ff4d4f" }} prefix={<CloseCircleOutlined />} /></Card></Col>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="Running" value={runningCount} valueStyle={{ color: "#1890ff" }} prefix={<SyncOutlined />} /></Card></Col>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="Avg Duration" value="7m 24s" prefix={<ClockCircleOutlined />} /></Card></Col>
      </Row>

      <Tabs
        defaultActiveKey="runs"
        items={[
          {
            key: "runs",
            label: "Pipeline Runs",
            children: (
              <Card>
                <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 160, marginBottom: 16 }}>
                  <Option value="all">All Statuses</Option>
                  <Option value="success">Success</Option>
                  <Option value="failed">Failed</Option>
                  <Option value="running">Running</Option>
                  <Option value="cancelled">Cancelled</Option>
                </Select>
                <Table columns={columns} dataSource={filteredRuns} rowKey="id" size="small" pagination={{ pageSize: 8 }}
                  expandable={{
                    expandedRowRender: (record) => (
                      <Steps size="small" current={record.stages.findIndex((s) => s.status === "running" || s.status === "failed")} status={record.status === "failed" ? "error" : "process"}
                        items={record.stages.map((stage) => ({
                          title: stage.name,
                          description: stage.duration,
                          status: stage.status === "success" ? "finish" : stage.status === "failed" ? "error" : stage.status === "running" ? "process" : "wait",
                        }))}
                      />
                    ),
                  }}
                />
              </Card>
            ),
          },
          {
            key: "trends",
            label: "Success Rate Trend",
            children: (
              <Card>
                <Row gutter={[16, 16]}>
                  {successRateTrend.map((item) => (
                    <Col xs={12} sm={8} md={4} key={item.week}>
                      <Card size="small" style={{ textAlign: "center" }}>
                        <Text strong>{item.week}</Text>
                        <Progress type="circle" percent={item.rate} size={80} strokeColor={item.rate >= 85 ? "#52c41a" : item.rate >= 75 ? "#faad14" : "#ff4d4f"} />
                        <div><Text type="secondary">{item.total} runs</Text></div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            ),
          },
          {
            key: "slowest",
            label: "Slowest Pipelines",
            children: (
              <Card>
                <List
                  dataSource={slowestPipelines}
                  renderItem={(item, idx) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Badge count={idx + 1} style={{ backgroundColor: idx < 3 ? "#ff4d4f" : "#faad14" }} />}
                        title={item.name}
                        description={`${item.runs} runs in last 30 days`}
                      />
                      <Space size="large">
                        <Statistic title="Avg" value={item.avgDuration} valueStyle={{ fontSize: 14 }} />
                        <Statistic title="P95" value={item.p95} valueStyle={{ fontSize: 14, color: "#ff4d4f" }} />
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            ),
          },
          {
            key: "failures",
            label: "Failure Analysis",
            children: (
              <Card>
                <Title level={5}>Common Failure Reasons</Title>
                <List
                  dataSource={failureReasons}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta title={item.reason} description={`${item.count} occurrences`} />
                      <Space size="large">
                        <Progress percent={item.percentage} size="small" style={{ width: 150 }} />
                        <Text style={{ color: item.trend === "up" ? "#ff4d4f" : item.trend === "down" ? "#52c41a" : "#8c8c8c" }}>
                          {item.trend === "up" ? <RiseOutlined /> : item.trend === "down" ? <FallOutlined /> : null} {item.trend}
                        </Text>
                      </Space>
                    </List.Item>
                  )}
                />
                <Divider />
                <Title level={5}><ExperimentOutlined /> Flaky Tests</Title>
                <Table
                  dataSource={flakyTests}
                  rowKey="name"
                  size="small"
                  pagination={false}
                  columns={[
                    { title: "Test", dataIndex: "name", key: "name" },
                    { title: "File", dataIndex: "file", key: "file", render: (f: string) => <Text code style={{ fontSize: 12 }}>{f}</Text> },
                    { title: "Fail Rate", dataIndex: "failRate", key: "failRate", render: (v: number) => <Tag color={v > 10 ? "error" : "warning"}>{v}%</Tag> },
                    { title: "Total Runs", dataIndex: "totalRuns", key: "totalRuns" },
                    { title: "Last Failed", dataIndex: "lastFailed", key: "lastFailed" },
                  ]}
                />
              </Card>
            ),
          },
          {
            key: "optimization",
            label: "Optimization Tips",
            children: (
              <Card>
                <List
                  dataSource={[
                    { title: "Enable build caching", description: "Docker layer caching could reduce erp-billing build time by ~40%", impact: "High", saving: "~4m per run" },
                    { title: "Parallelize test suites", description: "Split test suites across 3 workers instead of sequential execution", impact: "High", saving: "~3m per run" },
                    { title: "Use shallow git clone", description: "Replace full clone with depth=1 for faster checkout", impact: "Low", saving: "~15s per run" },
                    { title: "Cache npm dependencies", description: "Persist node_modules between runs using CI cache", impact: "Medium", saving: "~1m per run" },
                    { title: "Quarantine flaky tests", description: "Move 4 flaky tests to separate suite to reduce false failures", impact: "Medium", saving: "Reduces failure noise by ~15%" },
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<ThunderboltOutlined style={{ fontSize: 20, color: "#1890ff" }} />}
                        title={item.title}
                        description={item.description}
                      />
                      <Space>
                        <Tag color={item.impact === "High" ? "red" : item.impact === "Medium" ? "orange" : "blue"}>{item.impact} Impact</Tag>
                        <Text type="success">{item.saving}</Text>
                      </Space>
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

export default PipelineInsights;
