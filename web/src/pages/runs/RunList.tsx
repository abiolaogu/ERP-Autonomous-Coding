import React from "react";
import { Table, Typography, Space, Input, Select, Tag, Button } from "antd";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import { useTable } from "@refinedev/antd";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatRelativeTime, formatDuration, formatCurrency } from "@/utils/formatters";
import { RUN_STATUS_COLORS } from "@/utils/constants";
import type { CodingRun } from "@/types/coding.types";

const { Text } = Typography;

export const RunList: React.FC = () => {
  const navigate = useNavigate();

  const { tableProps } = useTable<CodingRun>({
    resource: "runs",
    pagination: { current: 1, pageSize: 20 },
    sorters: {
      initial: [{ field: "startedAt", order: "desc" }],
    },
  });

  const columns = [
    {
      title: "Agent",
      dataIndex: "agentName",
      key: "agentName",
      render: (name: string, record: CodingRun) => (
        <div>
          <Text strong>{name}</Text>
          <div style={{ fontSize: 12, color: "#6b7a8d", marginTop: 2 }}>
            {record.task?.substring(0, 50)}{(record.task?.length ?? 0) > 50 ? "..." : ""}
          </div>
        </div>
      ),
    },
    {
      title: "Repository",
      dataIndex: "repository",
      key: "repository",
      render: (repo: string) => (
        <Text code style={{ fontSize: 12 }}>{repo}</Text>
      ),
    },
    {
      title: "Branch",
      dataIndex: "branch",
      key: "branch",
      render: (branch: string) => (
        <Tag style={{ fontFamily: "monospace", fontSize: 11, borderRadius: 4 }}>
          {branch}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      filters: [
        { text: "Queued", value: "queued" },
        { text: "Running", value: "running" },
        { text: "Review", value: "review" },
        { text: "Completed", value: "completed" },
        { text: "Failed", value: "failed" },
        { text: "Cancelled", value: "cancelled" },
      ],
      render: (status: string) => (
        <StatusBadge status={status} colorMap={RUN_STATUS_COLORS} />
      ),
    },
    {
      title: "Files",
      dataIndex: "filesChanged",
      key: "filesChanged",
      width: 70,
      align: "center" as const,
      sorter: true,
    },
    {
      title: "Changes",
      key: "changes",
      width: 120,
      render: (_: unknown, record: CodingRun) => (
        <Space size={4}>
          <Text style={{ color: "#10b981", fontFamily: "monospace", fontWeight: 600, fontSize: 13 }}>
            +{record.additions}
          </Text>
          <Text style={{ color: "#ef4444", fontFamily: "monospace", fontWeight: 600, fontSize: 13 }}>
            -{record.deletions}
          </Text>
        </Space>
      ),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      width: 100,
      sorter: true,
      render: (d: number) => formatDuration(d),
    },
    {
      title: "Cost",
      dataIndex: "cost",
      key: "cost",
      width: 90,
      sorter: true,
      render: (cost: number) => formatCurrency(cost),
    },
    {
      title: "Started",
      dataIndex: "startedAt",
      key: "startedAt",
      width: 130,
      sorter: true,
      render: (d: string) => formatRelativeTime(d),
    },
    {
      title: "",
      key: "actions",
      width: 50,
      render: (_: unknown, record: CodingRun) => (
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/runs/${record.id}`)}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Coding Runs"
        subtitle="Monitor autonomous coding sessions"
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
          placeholder="Search runs..."
          style={{ maxWidth: 320 }}
          allowClear
        />
        <Select
          placeholder="Status"
          style={{ width: 140 }}
          allowClear
          options={[
            { label: "Queued", value: "queued" },
            { label: "Running", value: "running" },
            { label: "Review", value: "review" },
            { label: "Completed", value: "completed" },
            { label: "Failed", value: "failed" },
          ]}
        />
        <Select
          placeholder="Agent"
          style={{ width: 200 }}
          allowClear
          options={[
            { label: "TypeScript Refactor Bot", value: "agent-1" },
            { label: "Python Test Writer", value: "agent-2" },
            { label: "Go Optimizer", value: "agent-3" },
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
          onClick: () => navigate(`/runs/${record.id}`),
        })}
        pagination={{
          ...tableProps.pagination,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} runs`,
        }}
      />
    </div>
  );
};
