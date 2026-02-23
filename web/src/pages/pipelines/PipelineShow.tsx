import React from "react";
import {
  Card,
  Descriptions,
  Typography,
  Space,
  Button,
  Tag,
  Table,
  Steps,
  Row,
  Col,
  Progress,
  Switch,
} from "antd";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  ClockCircleOutlined,
  MinusCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { useShow } from "@refinedev/core";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { KPICard } from "@/components/common/KPICard";
import { formatDateTime, formatRelativeTime, formatDuration, formatPercentage } from "@/utils/formatters";
import type { Pipeline, PipelineStage } from "@/types/coding.types";

const { Text, Title } = Typography;

const mockPipeline: Pipeline = {
  id: "pipeline-1",
  name: "Frontend CI/CD",
  repository: "org/frontend-app",
  trigger: "pr",
  status: "active",
  successRate: 92,
  lastRunAt: "2026-02-23T09:45:00Z",
  stages: [
    { name: "Lint", type: "lint", status: "passed", duration: 45 },
    { name: "Unit Tests", type: "test", status: "passed", duration: 120 },
    { name: "Build", type: "build", status: "passed", duration: 180 },
    { name: "AI Review", type: "review", status: "running", duration: 90 },
    { name: "Deploy Staging", type: "deploy", status: "pending" },
  ],
};

const mockRunHistory = [
  {
    id: "prun-1",
    trigger: "PR #245",
    status: "running",
    startedAt: "2026-02-23T09:45:00Z",
    duration: 435,
    stages: ["passed", "passed", "passed", "running", "pending"],
  },
  {
    id: "prun-2",
    trigger: "PR #244",
    status: "passed",
    startedAt: "2026-02-23T08:20:00Z",
    duration: 520,
    stages: ["passed", "passed", "passed", "passed", "passed"],
  },
  {
    id: "prun-3",
    trigger: "PR #243",
    status: "failed",
    startedAt: "2026-02-22T16:10:00Z",
    duration: 180,
    stages: ["passed", "failed", "skipped", "skipped", "skipped"],
  },
  {
    id: "prun-4",
    trigger: "PR #242",
    status: "passed",
    startedAt: "2026-02-22T14:30:00Z",
    duration: 490,
    stages: ["passed", "passed", "passed", "passed", "passed"],
  },
  {
    id: "prun-5",
    trigger: "PR #241",
    status: "passed",
    startedAt: "2026-02-22T11:00:00Z",
    duration: 510,
    stages: ["passed", "passed", "passed", "passed", "passed"],
  },
];

export const PipelineShow: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { query } = useShow<Pipeline>({
    resource: "pipelines",
    id,
  });

  const pipeline = query?.data?.data || mockPipeline;

  const stageIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircleOutlined style={{ color: "#10b981" }} />;
      case "failed":
        return <CloseCircleOutlined style={{ color: "#ef4444" }} />;
      case "running":
        return <LoadingOutlined style={{ color: "#0f6fa8" }} />;
      case "skipped":
        return <MinusCircleOutlined style={{ color: "#94a3b8" }} />;
      default:
        return <ClockCircleOutlined style={{ color: "#94a3b8" }} />;
    }
  };

  const stageStepStatus = (status: string): "wait" | "process" | "finish" | "error" => {
    switch (status) {
      case "passed":
        return "finish";
      case "failed":
        return "error";
      case "running":
        return "process";
      default:
        return "wait";
    }
  };

  const stageStatusDot = (status: string) => {
    const colors: Record<string, string> = {
      passed: "#10b981",
      failed: "#ef4444",
      running: "#0f6fa8",
      skipped: "#e2e8f0",
      pending: "#e2e8f0",
    };
    return (
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: colors[status] || "#e2e8f0",
          display: "inline-block",
        }}
      />
    );
  };

  return (
    <div>
      <PageHeader
        title={pipeline.name}
        subtitle={pipeline.repository}
        onBack={() => navigate("/pipelines")}
        breadcrumbs={[
          { label: "Pipelines", path: "/pipelines" },
          { label: pipeline.name },
        ]}
        extra={
          <Space>
            <Button type="primary" icon={<PlayCircleOutlined />}>
              Run Pipeline
            </Button>
            {pipeline.status === "active" ? (
              <Button icon={<PauseCircleOutlined />}>Pause</Button>
            ) : (
              <Button icon={<PlayCircleOutlined />}>Resume</Button>
            )}
          </Space>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <KPICard
            title="Success Rate"
            value={formatPercentage(pipeline.successRate, 0)}
            color="#10b981"
          />
        </Col>
        <Col span={6}>
          <KPICard title="Total Runs" value={128} color="#0f6fa8" />
        </Col>
        <Col span={6}>
          <KPICard title="Avg Duration" value="8m 40s" color="#f59e0b" />
        </Col>
        <Col span={6}>
          <KPICard title="Failed (7d)" value={3} color="#ef4444" />
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Descriptions column={3} size="small">
          <Descriptions.Item label="Pipeline">{pipeline.name}</Descriptions.Item>
          <Descriptions.Item label="Repository">
            <Text code>{pipeline.repository}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Trigger">
            <Tag color="purple">{pipeline.trigger.toUpperCase()}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <StatusBadge status={pipeline.status} />
          </Descriptions.Item>
          <Descriptions.Item label="Last Run">
            {formatRelativeTime(pipeline.lastRunAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Enabled">
            <Switch checked={pipeline.status === "active"} size="small" />
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Current Pipeline Stage" style={{ marginBottom: 16 }}>
        <Steps
          current={pipeline.stages.findIndex((s) => s.status === "running")}
          items={pipeline.stages.map((stage) => ({
            title: stage.name,
            status: stageStepStatus(stage.status),
            icon: stageIcon(stage.status),
            description: stage.duration ? formatDuration(stage.duration) : stage.status,
          }))}
          style={{ padding: "16px 0" }}
        />
      </Card>

      <Card title="Run History" style={{ marginBottom: 16 }}>
        <Table
          dataSource={mockRunHistory}
          rowKey="id"
          pagination={false}
          size="small"
          columns={[
            {
              title: "Run",
              dataIndex: "id",
              key: "id",
              width: 100,
              render: (id: string) => <Text code>{id}</Text>,
            },
            {
              title: "Trigger",
              dataIndex: "trigger",
              key: "trigger",
              width: 120,
              render: (trigger: string) => (
                <Tag color="purple" style={{ fontSize: 12 }}>
                  {trigger}
                </Tag>
              ),
            },
            {
              title: "Status",
              dataIndex: "status",
              key: "status",
              width: 110,
              render: (status: string) => <StatusBadge status={status} />,
            },
            {
              title: "Stages",
              dataIndex: "stages",
              key: "stages",
              render: (stages: string[]) => (
                <Space size={4}>
                  {stages.map((status, idx) => (
                    <React.Fragment key={idx}>
                      {stageStatusDot(status)}
                    </React.Fragment>
                  ))}
                </Space>
              ),
            },
            {
              title: "Duration",
              dataIndex: "duration",
              key: "duration",
              width: 100,
              render: (d: number) => formatDuration(d),
            },
            {
              title: "Started",
              dataIndex: "startedAt",
              key: "startedAt",
              width: 140,
              render: (d: string) => formatRelativeTime(d),
            },
          ]}
        />
      </Card>

      <Card title="Stage Metrics">
        <Row gutter={[16, 16]}>
          {pipeline.stages.map((stage) => (
            <Col span={Math.floor(24 / pipeline.stages.length)} key={stage.name}>
              <div
                style={{
                  textAlign: "center",
                  padding: 16,
                  background: "#f8fafc",
                  borderRadius: 8,
                }}
              >
                <div style={{ marginBottom: 8 }}>
                  {stageIcon(stage.status)}
                </div>
                <Title level={5} style={{ margin: "4px 0" }}>
                  {stage.name}
                </Title>
                <Text type="secondary" style={{ fontSize: 12, textTransform: "uppercase" }}>
                  {stage.type}
                </Text>
                <div style={{ marginTop: 12 }}>
                  <Text style={{ fontSize: 20, fontWeight: 700, color: "#0f6fa8" }}>
                    {stage.duration ? formatDuration(stage.duration) : "--"}
                  </Text>
                </div>
                <Progress
                  percent={
                    stage.status === "passed"
                      ? 100
                      : stage.status === "running"
                      ? 65
                      : 0
                  }
                  showInfo={false}
                  size="small"
                  strokeColor={
                    stage.status === "passed"
                      ? "#10b981"
                      : stage.status === "failed"
                      ? "#ef4444"
                      : "#0f6fa8"
                  }
                  style={{ marginTop: 8 }}
                />
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};
