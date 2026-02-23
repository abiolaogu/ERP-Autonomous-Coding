import React from "react";
import { Table, Typography, Space, Input, Select, Tag, Button } from "antd";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import { useTable } from "@refinedev/antd";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatRelativeTime } from "@/utils/formatters";
import { APPROVAL_STATUS_COLORS } from "@/utils/constants";
import type { CodingApproval } from "@/types/coding.types";

const { Text } = Typography;

export const ApprovalList: React.FC = () => {
  const navigate = useNavigate();

  const { tableProps } = useTable<CodingApproval>({
    resource: "approvals",
    pagination: { current: 1, pageSize: 20 },
    sorters: {
      initial: [{ field: "createdAt", order: "desc" }],
    },
  });

  const columns = [
    {
      title: "Agent",
      dataIndex: "agentName",
      key: "agentName",
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 110,
      filters: [
        { text: "Merge", value: "merge" },
        { text: "Deploy", value: "deploy" },
        { text: "Rollback", value: "rollback" },
      ],
      render: (type: string) => {
        const colorMap: Record<string, string> = {
          merge: "blue",
          deploy: "green",
          rollback: "orange",
        };
        return <Tag color={colorMap[type] || "default"}>{type.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Summary",
      dataIndex: "summary",
      key: "summary",
      render: (summary: string) => (
        <Text style={{ fontSize: 13 }}>
          {summary?.substring(0, 80)}{(summary?.length ?? 0) > 80 ? "..." : ""}
        </Text>
      ),
    },
    {
      title: "Files",
      dataIndex: "filesChanged",
      key: "filesChanged",
      width: 70,
      align: "center" as const,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      filters: [
        { text: "Pending", value: "pending" },
        { text: "Approved", value: "approved" },
        { text: "Rejected", value: "rejected" },
      ],
      render: (status: string) => (
        <StatusBadge status={status} colorMap={APPROVAL_STATUS_COLORS} />
      ),
    },
    {
      title: "Reviewed By",
      dataIndex: "reviewedBy",
      key: "reviewedBy",
      width: 130,
      render: (reviewer: string) => reviewer || <Text type="secondary">-</Text>,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      sorter: true,
      render: (d: string) => formatRelativeTime(d),
    },
    {
      title: "",
      key: "actions",
      width: 50,
      render: (_: unknown, record: CodingApproval) => (
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/approvals/${record.id}`)}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Approvals"
        subtitle="Review and approve autonomous coding actions"
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
          placeholder="Search approvals..."
          style={{ maxWidth: 320 }}
          allowClear
        />
        <Select
          placeholder="Status"
          style={{ width: 130 }}
          allowClear
          options={[
            { label: "Pending", value: "pending" },
            { label: "Approved", value: "approved" },
            { label: "Rejected", value: "rejected" },
          ]}
        />
        <Select
          placeholder="Type"
          style={{ width: 130 }}
          allowClear
          options={[
            { label: "Merge", value: "merge" },
            { label: "Deploy", value: "deploy" },
            { label: "Rollback", value: "rollback" },
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
          onClick: () => navigate(`/approvals/${record.id}`),
        })}
        pagination={{
          ...tableProps.pagination,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} approvals`,
        }}
      />
    </div>
  );
};
