import React, { useState } from "react";
import {
  Card,
  Descriptions,
  Typography,
  Space,
  Button,
  Tag,
  Table,
  Input,
  Modal,
  Alert,
  Row,
  Col,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useShow } from "@refinedev/core";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDateTime } from "@/utils/formatters";
import type { CodingApproval } from "@/types/coding.types";

const { Text, Paragraph, Title } = Typography;
const { TextArea } = Input;

const mockApproval: CodingApproval = {
  id: "approval-1",
  runId: "run-1",
  agentName: "TypeScript Refactor Bot",
  type: "merge",
  status: "pending",
  summary:
    "Refactored DataTable component with performance optimizations including useMemo for sorting, virtual scrolling support, and removal of legacy OldTable component. All existing tests pass with 3 new tests added.",
  filesChanged: 3,
  createdAt: "2026-02-23T10:00:00Z",
};

const mockFiles = [
  { path: "src/components/DataTable.tsx", changeType: "modified", additions: 45, deletions: 22 },
  { path: "src/utils/sorting.ts", changeType: "added", additions: 28, deletions: 0 },
  { path: "src/components/OldTable.tsx", changeType: "deleted", additions: 0, deletions: 35 },
];

export const ApprovalShow: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [comment, setComment] = useState("");

  const { query } = useShow<CodingApproval>({
    resource: "approvals",
    id,
  });

  const approval = query?.data?.data || mockApproval;
  const isPending = approval.status === "pending";

  return (
    <div>
      <PageHeader
        title={`Approval Request`}
        subtitle={`${approval.type.toUpperCase()} - ${approval.agentName}`}
        onBack={() => navigate("/approvals")}
        breadcrumbs={[
          { label: "Approvals", path: "/approvals" },
          { label: `Approval ${id?.substring(0, 8) || ""}` },
        ]}
        extra={
          isPending ? (
            <Space>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                style={{ background: "#10b981", borderColor: "#10b981" }}
                onClick={() => setApproveModalOpen(true)}
              >
                Approve
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => setRejectModalOpen(true)}
              >
                Reject
              </Button>
            </Space>
          ) : null
        }
      />

      {approval.type === "rollback" && (
        <Alert
          message="Rollback Request"
          description="This is a rollback request. Approving will revert the changes made by the associated run."
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card style={{ marginBottom: 16 }}>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Agent">
                <Text strong>{approval.agentName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                <Tag
                  color={
                    approval.type === "merge"
                      ? "blue"
                      : approval.type === "deploy"
                      ? "green"
                      : "orange"
                  }
                >
                  {approval.type.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <StatusBadge status={approval.status} />
              </Descriptions.Item>
              <Descriptions.Item label="Files Changed">
                {approval.filesChanged}
              </Descriptions.Item>
              <Descriptions.Item label="Run">
                <a onClick={() => navigate(`/runs/${approval.runId}`)}>{approval.runId}</a>
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {formatDateTime(approval.createdAt)}
              </Descriptions.Item>
              {approval.reviewedBy && (
                <Descriptions.Item label="Reviewed By" span={2}>
                  {approval.reviewedBy}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          <Card title="Summary" style={{ marginBottom: 16 }}>
            <Paragraph style={{ fontSize: 14, lineHeight: 1.8 }}>
              {approval.summary}
            </Paragraph>
          </Card>

          <Card title="Changed Files">
            <Table
              dataSource={mockFiles}
              rowKey="path"
              pagination={false}
              size="small"
              columns={[
                {
                  title: "File",
                  dataIndex: "path",
                  key: "path",
                  render: (path: string) => (
                    <Space>
                      <FileTextOutlined style={{ color: "#6b7a8d" }} />
                      <Text code style={{ fontSize: 13 }}>{path}</Text>
                    </Space>
                  ),
                },
                {
                  title: "Type",
                  dataIndex: "changeType",
                  key: "changeType",
                  width: 100,
                  render: (type: string) => (
                    <Tag color={type === "added" ? "success" : type === "modified" ? "processing" : "error"}>
                      {type}
                    </Tag>
                  ),
                },
                {
                  title: "Changes",
                  key: "changes",
                  width: 120,
                  render: (_: unknown, record: (typeof mockFiles)[0]) => (
                    <Space size={4}>
                      <Text style={{ color: "#10b981", fontWeight: 600 }}>+{record.additions}</Text>
                      <Text style={{ color: "#ef4444", fontWeight: 600 }}>-{record.deletions}</Text>
                    </Space>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Activity" size="small">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {formatDateTime(approval.createdAt)}
                </Text>
                <div style={{ marginTop: 4 }}>
                  <Text strong>{approval.agentName}</Text>
                  <Text> requested {approval.type} approval</Text>
                </div>
              </div>
              {approval.reviewedBy && (
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {formatDateTime(approval.createdAt)}
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    <Text strong>{approval.reviewedBy}</Text>
                    <Text>
                      {" "}
                      {approval.status === "approved" ? "approved" : "rejected"} the request
                    </Text>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Approve Request"
        open={approveModalOpen}
        onCancel={() => setApproveModalOpen(false)}
        onOk={() => {
          setApproveModalOpen(false);
          setComment("");
        }}
        okText="Approve"
        okButtonProps={{ style: { background: "#10b981", borderColor: "#10b981" } }}
      >
        <Paragraph>
          You are about to approve this {approval.type} request. This will affect{" "}
          {approval.filesChanged} files.
        </Paragraph>
        <TextArea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Optional comment..."
        />
      </Modal>

      <Modal
        title="Reject Request"
        open={rejectModalOpen}
        onCancel={() => setRejectModalOpen(false)}
        onOk={() => {
          setRejectModalOpen(false);
          setComment("");
        }}
        okText="Reject"
        okButtonProps={{ danger: true }}
      >
        <Paragraph>Please provide a reason for rejecting this request:</Paragraph>
        <TextArea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Enter rejection reason..."
        />
      </Modal>
    </div>
  );
};
