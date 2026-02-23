import React, { useState } from "react";
import {
  Card,
  Typography,
  Space,
  Button,
  Tag,
  Input,
  Avatar,
  Divider,
  Descriptions,
  Row,
  Col,
  List,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useShow } from "@refinedev/core";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDateTime } from "@/utils/formatters";
import type { CodeReview, ReviewComment } from "@/types/coding.types";

const { Text, Paragraph, Title } = Typography;
const { TextArea } = Input;

const mockReview: CodeReview = {
  id: "review-1",
  runId: "run-1",
  agentName: "TypeScript Refactor Bot",
  filePath: "src/components/DataTable.tsx",
  changeType: "modified",
  additions: 45,
  deletions: 22,
  status: "pending",
  patch: `@@ -1,15 +1,25 @@
-import { useState } from 'react';
-import { Table } from './Table';
+import { useState, useMemo, useCallback } from 'react';
+import { Table, type TableProps } from './Table';
+import { useVirtualizer } from '@tanstack/react-virtual';
+
+interface SortConfig {
+  key: string;
+  direction: 'asc' | 'desc';
+}

 export const DataTable = ({ data, columns }) => {
-  const [sorted, setSorted] = useState(data);
+  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
+
+  const sortedData = useMemo(() => {
+    if (!sortConfig) return data;
+    return [...data].sort((a, b) => {
+      const aVal = a[sortConfig.key];
+      const bVal = b[sortConfig.key];
+      return sortConfig.direction === 'asc'
+        ? aVal < bVal ? -1 : 1
+        : bVal < aVal ? -1 : 1;
+    });
+  }, [data, sortConfig]);

   return (
-    <Table data={sorted} columns={columns} />
+    <Table data={sortedData} columns={columns} />
   );
 };`,
  comments: [
    {
      id: "c1",
      author: "John Developer",
      line: 12,
      body: "Good use of useMemo here. Consider adding a stable sort for equal values.",
      createdAt: "2026-02-23T10:30:00Z",
    },
    {
      id: "c2",
      author: "Jane Reviewer",
      line: 5,
      body: "The SortConfig interface should be exported and moved to a shared types file.",
      createdAt: "2026-02-23T10:45:00Z",
    },
  ],
};

export const CodeReviewShow: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState("");
  const [commentLine, setCommentLine] = useState<number | null>(null);

  const { query } = useShow<CodeReview>({
    resource: "reviews",
    id,
  });

  const review = query?.data?.data || mockReview;
  const lines = review.patch.split("\n");

  const commentsForLine = (lineNum: number): ReviewComment[] => {
    return review.comments.filter((c) => c.line === lineNum);
  };

  return (
    <div>
      <PageHeader
        title="Code Review"
        subtitle={review.filePath}
        onBack={() => navigate("/reviews")}
        breadcrumbs={[
          { label: "Code Reviews", path: "/reviews" },
          { label: review.filePath },
        ]}
        extra={
          <Space>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              style={{ background: "#10b981", borderColor: "#10b981" }}
            >
              Approve
            </Button>
            <Button
              icon={<ExclamationCircleOutlined />}
              style={{ color: "#f59e0b", borderColor: "#f59e0b" }}
            >
              Request Changes
            </Button>
            <Button danger icon={<CloseCircleOutlined />}>
              Reject
            </Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]}>
        <Col span={18}>
          <Card style={{ marginBottom: 16 }}>
            <Descriptions column={3} size="small">
              <Descriptions.Item label="Agent">
                <Text strong>{review.agentName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Change Type">
                <Tag
                  color={
                    review.changeType === "added"
                      ? "success"
                      : review.changeType === "modified"
                      ? "processing"
                      : "error"
                  }
                >
                  {review.changeType}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <StatusBadge status={review.status} />
              </Descriptions.Item>
              <Descriptions.Item label="File">
                <Text code>{review.filePath}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Changes">
                <Space>
                  <Text style={{ color: "#10b981", fontWeight: 600 }}>+{review.additions}</Text>
                  <Text style={{ color: "#ef4444", fontWeight: 600 }}>-{review.deletions}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Run">
                <a onClick={() => navigate(`/runs/${review.runId}`)}>{review.runId}</a>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Diff" styles={{ body: { padding: 0 } }}>
            <div
              style={{
                background: "#1e293b",
                borderRadius: "0 0 10px 10px",
                overflow: "hidden",
              }}
            >
              {lines.map((line, idx) => {
                let bgColor = "transparent";
                let textColor = "#e2e8f0";
                let borderColor = "transparent";

                if (line.startsWith("+") && !line.startsWith("+++")) {
                  bgColor = "rgba(16, 185, 129, 0.15)";
                  textColor = "#6ee7b7";
                  borderColor = "#10b981";
                } else if (line.startsWith("-") && !line.startsWith("---")) {
                  bgColor = "rgba(239, 68, 68, 0.15)";
                  textColor = "#fca5a5";
                  borderColor = "#ef4444";
                } else if (line.startsWith("@@")) {
                  bgColor = "rgba(15, 111, 168, 0.15)";
                  textColor = "#7dd3fc";
                  borderColor = "#0f6fa8";
                }

                const lineComments = commentsForLine(idx + 1);

                return (
                  <React.Fragment key={idx}>
                    <div
                      style={{
                        fontFamily: "'SF Mono', 'Fira Code', monospace",
                        fontSize: 13,
                        lineHeight: 1.7,
                        display: "flex",
                        borderLeft: `3px solid ${borderColor}`,
                        background: bgColor,
                        cursor: "pointer",
                      }}
                      onClick={() => setCommentLine(commentLine === idx + 1 ? null : idx + 1)}
                    >
                      <span
                        style={{
                          minWidth: 50,
                          padding: "0 8px",
                          color: "#64748b",
                          textAlign: "right",
                          userSelect: "none",
                          borderRight: "1px solid #334155",
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span style={{ padding: "0 12px", color: textColor, whiteSpace: "pre" }}>
                        {line}
                      </span>
                    </div>
                    {lineComments.map((comment) => (
                      <div
                        key={comment.id}
                        style={{
                          background: "#0f172a",
                          borderLeft: "3px solid #0f6fa8",
                          padding: "8px 16px 8px 66px",
                        }}
                      >
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                          <Avatar size={20} icon={<UserOutlined />} style={{ background: "#0f6fa8" }} />
                          <Text style={{ color: "#93c5fd", fontSize: 12, fontWeight: 600 }}>
                            {comment.author}
                          </Text>
                          <Text style={{ color: "#64748b", fontSize: 11 }}>
                            {formatDateTime(comment.createdAt)}
                          </Text>
                        </div>
                        <Text style={{ color: "#cbd5e1", fontSize: 13 }}>{comment.body}</Text>
                      </div>
                    ))}
                    {commentLine === idx + 1 && (
                      <div
                        style={{
                          background: "#0f172a",
                          borderLeft: "3px solid #f59e0b",
                          padding: "8px 16px 8px 66px",
                        }}
                      >
                        <TextArea
                          rows={2}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write a comment..."
                          style={{
                            background: "#1e293b",
                            borderColor: "#334155",
                            color: "#e2e8f0",
                            marginBottom: 8,
                          }}
                        />
                        <Space>
                          <Button
                            size="small"
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={() => {
                              setNewComment("");
                              setCommentLine(null);
                            }}
                          >
                            Comment
                          </Button>
                          <Button
                            size="small"
                            onClick={() => {
                              setNewComment("");
                              setCommentLine(null);
                            }}
                          >
                            Cancel
                          </Button>
                        </Space>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </Card>
        </Col>

        <Col span={6}>
          <Card title="Comments" size="small">
            {review.comments.length === 0 ? (
              <Text type="secondary">No comments yet</Text>
            ) : (
              <List
                dataSource={review.comments}
                renderItem={(comment) => (
                  <List.Item style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                        <Avatar size={18} icon={<UserOutlined />} style={{ background: "#0f6fa8" }} />
                        <Text strong style={{ fontSize: 12 }}>{comment.author}</Text>
                      </div>
                      <Text style={{ fontSize: 13 }}>{comment.body}</Text>
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          Line {comment.line} - {formatDateTime(comment.createdAt)}
                        </Text>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
