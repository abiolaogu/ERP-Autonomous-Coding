import React from "react";
import { Table, Button, Space, Tag, Input, Select, Tooltip } from "antd";
import {
  PlusOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useTable } from "@refinedev/antd";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatRelativeTime } from "@/utils/formatters";
import { LANGUAGE_COLORS, AGENT_STATUS_COLORS } from "@/utils/constants";
import type { CodingAgent } from "@/types/coding.types";

export const AgentList: React.FC = () => {
  const navigate = useNavigate();

  const { tableProps, searchFormProps } = useTable<CodingAgent>({
    resource: "agents",
    pagination: { current: 1, pageSize: 20 },
    sorters: {
      initial: [{ field: "name", order: "asc" }],
    },
  });

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
      render: (name: string, record: CodingAgent) => (
        <div>
          <a onClick={() => navigate(`/agents/${record.id}`)} style={{ fontWeight: 600 }}>
            {name}
          </a>
          <div style={{ fontSize: 12, color: "#6b7a8d", marginTop: 2 }}>
            {record.description?.substring(0, 60)}
            {(record.description?.length ?? 0) > 60 ? "..." : ""}
          </div>
        </div>
      ),
    },
    {
      title: "Language",
      dataIndex: "language",
      key: "language",
      width: 130,
      render: (lang: string) => (
        <Tag
          style={{
            borderRadius: 6,
            fontWeight: 500,
            borderColor: LANGUAGE_COLORS[lang] || "#d1d5db",
            color: LANGUAGE_COLORS[lang] || "#6b7a8d",
            background: `${LANGUAGE_COLORS[lang] || "#6b7a8d"}12`,
          }}
        >
          {lang}
        </Tag>
      ),
    },
    {
      title: "Repository",
      dataIndex: "repository",
      key: "repository",
      render: (repo: string) => (
        <span style={{ fontFamily: "monospace", fontSize: 13 }}>{repo}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      filters: [
        { text: "Idle", value: "idle" },
        { text: "Running", value: "running" },
        { text: "Paused", value: "paused" },
        { text: "Error", value: "error" },
      ],
      render: (status: string) => (
        <StatusBadge status={status} colorMap={AGENT_STATUS_COLORS} />
      ),
    },
    {
      title: "Model",
      dataIndex: "model",
      key: "model",
      width: 140,
      render: (model: string) => <Tag>{model}</Tag>,
    },
    {
      title: "Last Run",
      dataIndex: "lastRunAt",
      key: "lastRunAt",
      width: 140,
      sorter: true,
      render: (date: string) => formatRelativeTime(date),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: unknown, record: CodingAgent) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/agents/${record.id}`)}
            />
          </Tooltip>
          {record.status === "idle" || record.status === "paused" ? (
            <Tooltip title="Run Agent">
              <Button
                type="text"
                size="small"
                icon={<PlayCircleOutlined style={{ color: "#10b981" }} />}
              />
            </Tooltip>
          ) : record.status === "running" ? (
            <Tooltip title="Pause Agent">
              <Button
                type="text"
                size="small"
                icon={<PauseCircleOutlined style={{ color: "#f59e0b" }} />}
              />
            </Tooltip>
          ) : null}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Coding Agents"
        subtitle="Manage autonomous coding agents"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/agents/create")}
          >
            Create Agent
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
          placeholder="Search agents..."
          style={{ maxWidth: 320 }}
          allowClear
        />
        <Select
          placeholder="Language"
          style={{ width: 150 }}
          allowClear
          options={[
            { label: "TypeScript", value: "TypeScript" },
            { label: "Python", value: "Python" },
            { label: "Go", value: "Go" },
            { label: "Rust", value: "Rust" },
            { label: "Java", value: "Java" },
          ]}
        />
        <Select
          placeholder="Status"
          style={{ width: 130 }}
          allowClear
          options={[
            { label: "Idle", value: "idle" },
            { label: "Running", value: "running" },
            { label: "Paused", value: "paused" },
            { label: "Error", value: "error" },
          ]}
        />
      </div>

      <Table
        {...tableProps}
        columns={columns}
        rowKey="id"
        style={{ background: "#fff", borderRadius: 10 }}
        pagination={{
          ...tableProps.pagination,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} agents`,
        }}
      />
    </div>
  );
};

export default AgentList;
