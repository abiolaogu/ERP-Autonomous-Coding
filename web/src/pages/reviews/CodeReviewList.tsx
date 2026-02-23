import React from "react";
import { Table, Typography, Space, Input, Select, Tag, Button, Badge } from "antd";
import { SearchOutlined, EyeOutlined, MessageOutlined } from "@ant-design/icons";
import { useTable } from "@refinedev/antd";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { REVIEW_STATUS_COLORS } from "@/utils/constants";
import type { CodeReview } from "@/types/coding.types";

const { Text } = Typography;

export const CodeReviewList: React.FC = () => {
  const navigate = useNavigate();

  const { tableProps } = useTable<CodeReview>({
    resource: "reviews",
    pagination: { current: 1, pageSize: 20 },
  });

  const columns = [
    {
      title: "File Path",
      dataIndex: "filePath",
      key: "filePath",
      render: (path: string) => (
        <Text code style={{ fontSize: 13 }}>{path}</Text>
      ),
    },
    {
      title: "Agent",
      dataIndex: "agentName",
      key: "agentName",
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: "Change Type",
      dataIndex: "changeType",
      key: "changeType",
      width: 110,
      filters: [
        { text: "Added", value: "added" },
        { text: "Modified", value: "modified" },
        { text: "Deleted", value: "deleted" },
      ],
      render: (type: string) => {
        const color = type === "added" ? "success" : type === "modified" ? "processing" : "error";
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: "Changes",
      key: "changes",
      width: 120,
      render: (_: unknown, record: CodeReview) => (
        <Space size={4}>
          <Text style={{ color: "#10b981", fontFamily: "monospace", fontWeight: 600 }}>
            +{record.additions}
          </Text>
          <Text style={{ color: "#ef4444", fontFamily: "monospace", fontWeight: 600 }}>
            -{record.deletions}
          </Text>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 150,
      filters: [
        { text: "Pending", value: "pending" },
        { text: "Approved", value: "approved" },
        { text: "Changes Requested", value: "changes_requested" },
        { text: "Rejected", value: "rejected" },
      ],
      render: (status: string) => (
        <StatusBadge status={status} colorMap={REVIEW_STATUS_COLORS} />
      ),
    },
    {
      title: "Comments",
      key: "comments",
      width: 100,
      align: "center" as const,
      render: (_: unknown, record: CodeReview) => (
        <Badge count={record.comments?.length || 0} showZero style={{ backgroundColor: "#6b7a8d" }}>
          <MessageOutlined style={{ fontSize: 16, color: "#6b7a8d" }} />
        </Badge>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 50,
      render: (_: unknown, record: CodeReview) => (
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/reviews/${record.id}`)}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Code Reviews"
        subtitle="Review AI-generated code changes"
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
          placeholder="Search by file path..."
          style={{ maxWidth: 320 }}
          allowClear
        />
        <Select
          placeholder="Status"
          style={{ width: 160 }}
          allowClear
          options={[
            { label: "Pending", value: "pending" },
            { label: "Approved", value: "approved" },
            { label: "Changes Requested", value: "changes_requested" },
            { label: "Rejected", value: "rejected" },
          ]}
        />
        <Select
          placeholder="Change Type"
          style={{ width: 140 }}
          allowClear
          options={[
            { label: "Added", value: "added" },
            { label: "Modified", value: "modified" },
            { label: "Deleted", value: "deleted" },
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
          onClick: () => navigate(`/reviews/${record.id}`),
        })}
        pagination={{
          ...tableProps.pagination,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} reviews`,
        }}
      />
    </div>
  );
};

export default CodeReviewList;
