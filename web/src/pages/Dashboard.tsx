import React from "react";
import { Row, Col, Card, Typography, Table, Tag, Progress } from "antd";
import {
  RobotOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  CodeOutlined,
  EyeOutlined,
  LikeOutlined,
} from "@ant-design/icons";
import { useList } from "@refinedev/core";
import { KPICard } from "@/components/common/KPICard";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatRelativeTime, formatDuration, formatCurrency } from "@/utils/formatters";
import { LANGUAGE_COLORS } from "@/utils/constants";
import type { CodingRun, CodingAgent } from "@/types/coding.types";

const { Text } = Typography;

const mockMetrics = {
  totalAgents: 12,
  activeRuns: 4,
  completedToday: 23,
  linesChanged: 8547,
  reviewsPending: 7,
  approvalRate: 92.3,
};

const mockDailyActivity = [
  { day: "Mon", runs: 18, linesChanged: 4200 },
  { day: "Tue", runs: 22, linesChanged: 5800 },
  { day: "Wed", runs: 15, linesChanged: 3100 },
  { day: "Thu", runs: 28, linesChanged: 7200 },
  { day: "Fri", runs: 23, linesChanged: 6500 },
  { day: "Sat", runs: 8, linesChanged: 2100 },
  { day: "Sun", runs: 5, linesChanged: 1200 },
];

const mockLanguageDistribution = [
  { language: "TypeScript", count: 34, percentage: 38 },
  { language: "Python", count: 22, percentage: 25 },
  { language: "Go", count: 14, percentage: 16 },
  { language: "Rust", count: 10, percentage: 11 },
  { language: "Java", count: 9, percentage: 10 },
];

const mockAgentPerformance = [
  { name: "TypeScript Refactor Bot", runs: 45, successRate: 96, avgDuration: 180 },
  { name: "Python Test Writer", runs: 38, successRate: 91, avgDuration: 240 },
  { name: "Go Optimizer", runs: 28, successRate: 89, avgDuration: 150 },
  { name: "Rust Safety Checker", runs: 22, successRate: 95, avgDuration: 120 },
];

export const Dashboard: React.FC = () => {
  const { data: runsData } = useList<CodingRun>({
    resource: "runs",
    pagination: { current: 1, pageSize: 5 },
    sorters: [{ field: "startedAt", order: "desc" }],
  });

  const { data: agentsData } = useList<CodingAgent>({
    resource: "agents",
    pagination: { current: 1, pageSize: 10 },
  });

  const recentRuns = runsData?.data ?? [];
  const _agents = agentsData?.data ?? [];

  const recentRunColumns = [
    {
      title: "Agent",
      dataIndex: "agentName",
      key: "agentName",
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: "Repository",
      dataIndex: "repository",
      key: "repository",
      render: (repo: string) => (
        <Text code style={{ fontSize: 12 }}>
          {repo}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <StatusBadge status={status} />,
    },
    {
      title: "Changes",
      key: "changes",
      render: (_: unknown, record: CodingRun) => (
        <span>
          <Text style={{ color: "#10b981" }}>+{record.additions}</Text>
          {" / "}
          <Text style={{ color: "#ef4444" }}>-{record.deletions}</Text>
        </span>
      ),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      render: (d: number) => formatDuration(d),
    },
    {
      title: "Cost",
      dataIndex: "cost",
      key: "cost",
      render: (cost: number) => formatCurrency(cost),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Autonomous coding activity overview"
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={4}>
          <KPICard
            title="Total Agents"
            value={mockMetrics.totalAgents}
            icon={<RobotOutlined />}
            color="#0f6fa8"
            change={8}
            changeLabel="vs last week"
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <KPICard
            title="Active Runs"
            value={mockMetrics.activeRuns}
            icon={<PlayCircleOutlined />}
            color="#8b5cf6"
            change={12}
            changeLabel="vs yesterday"
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <KPICard
            title="Completed Today"
            value={mockMetrics.completedToday}
            icon={<CheckCircleOutlined />}
            color="#10b981"
            change={15}
            changeLabel="vs yesterday"
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <KPICard
            title="Lines Changed"
            value={mockMetrics.linesChanged.toLocaleString()}
            icon={<CodeOutlined />}
            color="#f59e0b"
            change={-3}
            changeLabel="vs yesterday"
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <KPICard
            title="Reviews Pending"
            value={mockMetrics.reviewsPending}
            icon={<EyeOutlined />}
            color="#ef4444"
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <KPICard
            title="Approval Rate"
            value={`${mockMetrics.approvalRate}%`}
            icon={<LikeOutlined />}
            color="#10b981"
            change={2.1}
            changeLabel="vs last week"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="Daily Activity" styles={{ body: { padding: "16px 24px" } }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 200 }}>
              {mockDailyActivity.map((item) => (
                <div
                  key={item.day}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      maxWidth: 40,
                      height: `${(item.runs / 30) * 160}px`,
                      background: "linear-gradient(180deg, #0f6fa8, #0f6fa860)",
                      borderRadius: 6,
                      transition: "height 0.3s ease",
                    }}
                  />
                  <Text style={{ fontSize: 11, fontWeight: 600 }}>{item.runs}</Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {item.day}
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Language Distribution" styles={{ body: { padding: "16px 24px" } }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {mockLanguageDistribution.map((item) => (
                <div key={item.language}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: LANGUAGE_COLORS[item.language] || "#6b7a8d",
                        }}
                      />
                      <Text style={{ fontWeight: 500 }}>{item.language}</Text>
                    </div>
                    <Text type="secondary">{item.count} runs ({item.percentage}%)</Text>
                  </div>
                  <Progress
                    percent={item.percentage}
                    showInfo={false}
                    strokeColor={LANGUAGE_COLORS[item.language] || "#6b7a8d"}
                    trailColor="#f1f5f9"
                    size="small"
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Agent Performance">
            <Table
              dataSource={mockAgentPerformance}
              rowKey="name"
              pagination={false}
              size="small"
              columns={[
                {
                  title: "Agent",
                  dataIndex: "name",
                  key: "name",
                  render: (name: string) => <Text strong>{name}</Text>,
                },
                {
                  title: "Total Runs",
                  dataIndex: "runs",
                  key: "runs",
                  align: "center",
                },
                {
                  title: "Success Rate",
                  dataIndex: "successRate",
                  key: "successRate",
                  align: "center",
                  render: (rate: number) => (
                    <Tag color={rate >= 90 ? "success" : rate >= 75 ? "warning" : "error"}>
                      {rate}%
                    </Tag>
                  ),
                },
                {
                  title: "Avg Duration",
                  dataIndex: "avgDuration",
                  key: "avgDuration",
                  align: "center",
                  render: (d: number) => formatDuration(d),
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Recent Runs">
            <Table
              dataSource={recentRuns}
              rowKey="id"
              pagination={false}
              size="small"
              columns={recentRunColumns}
              locale={{
                emptyText: (
                  <div style={{ padding: 40, textAlign: "center" }}>
                    <PlayCircleOutlined style={{ fontSize: 32, color: "#d1d5db", marginBottom: 8 }} />
                    <br />
                    <Text type="secondary">No recent runs</Text>
                  </div>
                ),
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
