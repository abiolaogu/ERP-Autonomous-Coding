import React from "react";
import { Card, Tabs, Descriptions, Table, Tag, Typography, Space, Button, Progress, Timeline, Row, Col } from "antd";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useShow } from "@refinedev/core";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { KPICard } from "@/components/common/KPICard";
import { formatDateTime, formatRelativeTime, formatDuration, formatCurrency } from "@/utils/formatters";
import { LANGUAGE_COLORS } from "@/utils/constants";
import type { CodingAgent, CodingRun } from "@/types/coding.types";

const { Text, Paragraph } = Typography;

const mockRecentRuns: CodingRun[] = [
  {
    id: "run-1",
    agentId: "agent-1",
    agentName: "TypeScript Refactor Bot",
    repository: "org/frontend-app",
    branch: "auto/refactor-components",
    status: "completed",
    task: "Refactor component tree for performance",
    filesChanged: 12,
    additions: 340,
    deletions: 180,
    startedAt: "2026-02-23T08:00:00Z",
    completedAt: "2026-02-23T08:05:30Z",
    duration: 330,
    tokensUsed: 45000,
    cost: 0.12,
  },
  {
    id: "run-2",
    agentId: "agent-1",
    agentName: "TypeScript Refactor Bot",
    repository: "org/frontend-app",
    branch: "auto/fix-types",
    status: "running",
    task: "Fix strict TypeScript errors",
    filesChanged: 8,
    additions: 120,
    deletions: 45,
    startedAt: "2026-02-23T09:15:00Z",
    duration: 180,
    tokensUsed: 32000,
    cost: 0.08,
  },
  {
    id: "run-3",
    agentId: "agent-1",
    agentName: "TypeScript Refactor Bot",
    repository: "org/frontend-app",
    branch: "auto/add-tests",
    status: "review",
    task: "Generate unit tests for utils",
    filesChanged: 6,
    additions: 480,
    deletions: 0,
    startedAt: "2026-02-22T14:00:00Z",
    completedAt: "2026-02-22T14:08:00Z",
    duration: 480,
    tokensUsed: 62000,
    cost: 0.18,
  },
];

const mockLogs = [
  { time: "09:15:00", level: "info", message: "Agent started - Task: Fix strict TypeScript errors" },
  { time: "09:15:02", level: "info", message: "Cloning repository org/frontend-app..." },
  { time: "09:15:08", level: "info", message: "Repository cloned. Analyzing codebase..." },
  { time: "09:15:15", level: "info", message: "Found 45 TypeScript strict mode errors" },
  { time: "09:15:20", level: "info", message: "Generating fixes for src/utils/helpers.ts" },
  { time: "09:16:30", level: "info", message: "Fixed 12 errors in src/utils/helpers.ts" },
  { time: "09:17:00", level: "warn", message: "Complex type inference needed for src/hooks/useData.ts" },
  { time: "09:17:45", level: "info", message: "Generating fixes for src/hooks/useData.ts" },
  { time: "09:18:00", level: "info", message: "Running TypeScript compiler check..." },
];

export const AgentShow: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { query } = useShow<CodingAgent>({
    resource: "agents",
    id,
  });

  const agent = query?.data?.data;

  const runColumns = [
    {
      title: "Branch",
      dataIndex: "branch",
      key: "branch",
      render: (branch: string) => (
        <Text code style={{ fontSize: 12 }}>{branch}</Text>
      ),
    },
    {
      title: "Task",
      dataIndex: "task",
      key: "task",
      render: (task: string) => <Text>{task}</Text>,
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
        <Space>
          <Text style={{ color: "#10b981", fontFamily: "monospace" }}>+{record.additions}</Text>
          <Text style={{ color: "#ef4444", fontFamily: "monospace" }}>-{record.deletions}</Text>
        </Space>
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
      render: (c: number) => formatCurrency(c),
    },
    {
      title: "Started",
      dataIndex: "startedAt",
      key: "startedAt",
      render: (d: string) => formatRelativeTime(d),
    },
  ];

  return (
    <div>
      <PageHeader
        title={agent?.name || "Agent Details"}
        subtitle={agent?.description}
        onBack={() => navigate("/agents")}
        breadcrumbs={[
          { label: "Agents", path: "/agents" },
          { label: agent?.name || "Details" },
        ]}
        extra={
          <Space>
            {agent?.status === "idle" || agent?.status === "paused" ? (
              <Button type="primary" icon={<PlayCircleOutlined />}>
                Run Agent
              </Button>
            ) : agent?.status === "running" ? (
              <Button icon={<PauseCircleOutlined />}>Pause</Button>
            ) : null}
            <Button icon={<EditOutlined />}>Edit</Button>
            <Button danger icon={<DeleteOutlined />}>Delete</Button>
          </Space>
        }
      />

      <Tabs
        defaultActiveKey="config"
        items={[
          {
            key: "config",
            label: (
              <span>
                <SettingOutlined /> Configuration
              </span>
            ),
            children: (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card>
                    <Descriptions column={2} bordered size="small">
                      <Descriptions.Item label="Name">{agent?.name || "-"}</Descriptions.Item>
                      <Descriptions.Item label="Status">
                        <StatusBadge status={agent?.status || "idle"} />
                      </Descriptions.Item>
                      <Descriptions.Item label="Language">
                        <Tag
                          style={{
                            borderRadius: 6,
                            color: LANGUAGE_COLORS[agent?.language || ""] || "#6b7a8d",
                            borderColor: LANGUAGE_COLORS[agent?.language || ""] || "#d1d5db",
                            background: `${LANGUAGE_COLORS[agent?.language || ""] || "#6b7a8d"}12`,
                          }}
                        >
                          {agent?.language || "-"}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Model">
                        <Tag>{agent?.model || "-"}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Repository">
                        <Text code>{agent?.repository || "-"}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Max Tokens">
                        {agent?.maxTokens?.toLocaleString() || "-"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Created">
                        {formatDateTime(agent?.createdAt)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Last Run">
                        {formatRelativeTime(agent?.lastRunAt)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Description" span={2}>
                        <Paragraph style={{ margin: 0 }}>{agent?.description || "-"}</Paragraph>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: "runs",
            label: (
              <span>
                <PlayCircleOutlined /> Recent Runs
              </span>
            ),
            children: (
              <Card>
                <Table
                  dataSource={mockRecentRuns}
                  columns={runColumns}
                  rowKey="id"
                  pagination={false}
                  onRow={(record) => ({
                    style: { cursor: "pointer" },
                    onClick: () => navigate(`/runs/${record.id}`),
                  })}
                />
              </Card>
            ),
          },
          {
            key: "performance",
            label: "Performance Metrics",
            children: (
              <div>
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                  <Col span={6}>
                    <KPICard title="Total Runs" value={45} color="#0f6fa8" />
                  </Col>
                  <Col span={6}>
                    <KPICard title="Success Rate" value="96%" color="#10b981" />
                  </Col>
                  <Col span={6}>
                    <KPICard title="Avg Duration" value="5m 30s" color="#f59e0b" />
                  </Col>
                  <Col span={6}>
                    <KPICard title="Total Cost" value="$4.52" color="#8b5cf6" />
                  </Col>
                </Row>
                <Card title="Run History">
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 180, padding: "0 16px" }}>
                    {Array.from({ length: 14 }, (_, i) => {
                      const height = Math.random() * 140 + 20;
                      const success = Math.random() > 0.15;
                      return (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <div
                            style={{
                              width: "100%",
                              height,
                              background: success
                                ? "linear-gradient(180deg, #10b981, #10b98160)"
                                : "linear-gradient(180deg, #ef4444, #ef444460)",
                              borderRadius: 4,
                            }}
                          />
                          <Text style={{ fontSize: 10, color: "#94a3b8" }}>
                            {i + 1}
                          </Text>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            ),
          },
          {
            key: "logs",
            label: "Logs",
            children: (
              <Card>
                <div
                  style={{
                    background: "#0a1628",
                    borderRadius: 8,
                    padding: 16,
                    fontFamily: "'SF Mono', 'Fira Code', monospace",
                    fontSize: 13,
                    lineHeight: 1.8,
                    maxHeight: 500,
                    overflow: "auto",
                  }}
                >
                  {mockLogs.map((log, idx) => (
                    <div key={idx}>
                      <span style={{ color: "#6b7a8d" }}>[{log.time}]</span>{" "}
                      <span
                        style={{
                          color:
                            log.level === "warn"
                              ? "#f59e0b"
                              : log.level === "error"
                              ? "#ef4444"
                              : "#10b981",
                        }}
                      >
                        [{log.level.toUpperCase()}]
                      </span>{" "}
                      <span style={{ color: "#e2e8f0" }}>{log.message}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

export default AgentShow;
