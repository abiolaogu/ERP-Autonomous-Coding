import React from "react";
import { Table, Typography, Space, Input, Select, Tag, Button, Progress } from "antd";
import { SearchOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { useTable } from "@refinedev/antd";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatRelativeTime, formatPercentage } from "@/utils/formatters";
import { PIPELINE_STATUS_COLORS, STAGE_STATUS_COLORS } from "@/utils/constants";
import type { Pipeline, PipelineStage } from "@/types/coding.types";

const { Text } = Typography;

export const PipelineList: React.FC = () => {
  const navigate = useNavigate();

  const { tableProps } = useTable<Pipeline>({
    resource: "pipelines",
    pagination: { current: 1, pageSize: 20 },
  });

  const triggerColors: Record<string, string> = {
    push: "blue",
    pr: "purple",
    schedule: "cyan",
    manual: "default",
  };

  const stageStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return { bg: "#10b981", text: "#fff" };
      case "failed":
        return { bg: "#ef4444", text: "#fff" };
      case "running":
        return { bg: "#0f6fa8", text: "#fff" };
      case "skipped":
        return { bg: "#e2e8f0", text: "#94a3b8" };
      default:
        return { bg: "#f1f5f9", text: "#94a3b8" };
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: Pipeline) => (
        <div>
          <a onClick={() => navigate(`/pipelines/${record.id}`)} style={{ fontWeight: 600 }}>
            {name}
          </a>
          <div style={{ fontSize: 12, color: "#6b7a8d", marginTop: 2 }}>
            {record.repository}
          </div>
        </div>
      ),
    },
    {
      title: "Trigger",
      dataIndex: "trigger",
      key: "trigger",
      width: 100,
      render: (trigger: string) => (
        <Tag color={triggerColors[trigger] || "default"}>
          {trigger.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <StatusBadge status={status} colorMap={PIPELINE_STATUS_COLORS} />
      ),
    },
    {
      title: "Stages",
      dataIndex: "stages",
      key: "stages",
      width: 250,
      render: (stages: PipelineStage[]) => (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {stages?.map((stage, idx) => {
            const colors = stageStatusIcon(stage.status);
            return (
              <React.Fragment key={stage.name}>
                <div
                  title={`${stage.name}: ${stage.status}`}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: colors.bg,
                    color: colors.text,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    cursor: "default",
                  }}
                >
                  {stage.type.charAt(0).toUpperCase()}
                </div>
                {idx < stages.length - 1 && (
                  <div
                    style={{
                      width: 12,
                      height: 2,
                      background:
                        stage.status === "passed"
                          ? "#10b981"
                          : stage.status === "failed"
                          ? "#ef4444"
                          : "#e2e8f0",
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      ),
    },
    {
      title: "Success Rate",
      dataIndex: "successRate",
      key: "successRate",
      width: 150,
      sorter: true,
      render: (rate: number) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Progress
            percent={rate}
            showInfo={false}
            size="small"
            strokeColor={rate >= 80 ? "#10b981" : rate >= 60 ? "#f59e0b" : "#ef4444"}
            style={{ flex: 1, minWidth: 60 }}
          />
          <Text style={{ fontSize: 13, fontWeight: 600, minWidth: 40 }}>
            {formatPercentage(rate, 0)}
          </Text>
        </div>
      ),
    },
    {
      title: "Last Run",
      dataIndex: "lastRunAt",
      key: "lastRunAt",
      width: 130,
      render: (d: string) => formatRelativeTime(d),
    },
    {
      title: "",
      key: "actions",
      width: 50,
      render: (_: unknown, record: Pipeline) => (
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/pipelines/${record.id}`)}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Pipelines"
        subtitle="CI/CD pipeline management"
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Create Pipeline
          </Button>
        }
      />

      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: 16,
          marginBottom: 16,
          display: "flex",
          gap: 12,
        }}
      >
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search pipelines..."
          style={{ maxWidth: 320 }}
          allowClear
        />
        <Select
          placeholder="Status"
          style={{ width: 130 }}
          allowClear
          options={[
            { label: "Active", value: "active" },
            { label: "Paused", value: "paused" },
            { label: "Disabled", value: "disabled" },
          ]}
        />
        <Select
          placeholder="Trigger"
          style={{ width: 130 }}
          allowClear
          options={[
            { label: "Push", value: "push" },
            { label: "PR", value: "pr" },
            { label: "Schedule", value: "schedule" },
            { label: "Manual", value: "manual" },
          ]}
        />
      </div>

      <Table
        {...tableProps}
        columns={columns}
        rowKey="id"
        style={{ background: "#fff", borderRadius: 10 }}
        onRow={(record) => ({
          style: { cursor: "pointer" },
          onClick: () => navigate(`/pipelines/${record.id}`),
        })}
        pagination={{
          ...tableProps.pagination,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} pipelines`,
        }}
      />
    </div>
  );
};
