import React from "react";
import {
  Card,
  Descriptions,
  Typography,
  Space,
  Button,
  Tag,
  Table,
  Row,
  Col,
  Divider,
  Input,
  Modal,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  PlusOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import { useShow } from "@refinedev/core";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { KPICard } from "@/components/common/KPICard";
import { formatDateTime, formatDuration, formatCurrency, formatTokens } from "@/utils/formatters";
import type { CodingRun } from "@/types/coding.types";

const { Text, Paragraph, Title } = Typography;
const { TextArea } = Input;

const mockFileChanges = [
  {
    path: "src/components/DataTable.tsx",
    changeType: "modified",
    additions: 45,
    deletions: 22,
    patch: `@@ -12,8 +12,12 @@
-import { useState } from 'react';
-import { Table } from './Table';
+import { useState, useMemo, useCallback } from 'react';
+import { Table, type TableProps } from './Table';
+import { useVirtualizer } from '@tanstack/react-virtual';

 export const DataTable = ({ data, columns }) => {
-  const [sorted, setSorted] = useState(data);
+  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
+
+  const sortedData = useMemo(() => {
+    if (!sortConfig) return data;
+    return [...data].sort((a, b) => {
+      const aVal = a[sortConfig.key];
+      const bVal = b[sortConfig.key];
+      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
+    });
+  }, [data, sortConfig]);`,
  },
  {
    path: "src/utils/sorting.ts",
    changeType: "added",
    additions: 28,
    deletions: 0,
    patch: `@@ -0,0 +1,28 @@
+export interface SortConfig {
+  key: string;
+  direction: 'asc' | 'desc';
+}
+
+export function createSorter<T>(config: SortConfig) {
+  return (a: T, b: T) => {
+    const aVal = (a as Record<string, unknown>)[config.key];
+    const bVal = (b as Record<string, unknown>)[config.key];
+    if (aVal < bVal) return config.direction === 'asc' ? -1 : 1;
+    if (aVal > bVal) return config.direction === 'asc' ? 1 : -1;
+    return 0;
+  };
+}`,
  },
  {
    path: "src/components/OldTable.tsx",
    changeType: "deleted",
    additions: 0,
    deletions: 35,
    patch: `@@ -1,35 +0,0 @@
-import React from 'react';
-
-// Legacy table component - replaced by DataTable
-export const OldTable = ({ data }) => {
-  return (
-    <table>
-      <tbody>
-        {data.map((row, i) => (
-          <tr key={i}>
-            {Object.values(row).map((cell, j) => (
-              <td key={j}>{String(cell)}</td>
-            ))}
-          </tr>
-        ))}
-      </tbody>
-    </table>
-  );
-};`,
  },
];

export const RunShow: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rejectModalOpen, setRejectModalOpen] = React.useState(false);

  const { query } = useShow<CodingRun>({
    resource: "runs",
    id,
  });

  const run = query?.data?.data;

  const changeTypeColor = (type: string) => {
    switch (type) {
      case "added":
        return "success";
      case "modified":
        return "processing";
      case "deleted":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <div>
      <PageHeader
        title={`Run ${id?.substring(0, 8)}`}
        subtitle={run?.task || "Coding run details"}
        onBack={() => navigate("/runs")}
        breadcrumbs={[
          { label: "Runs", path: "/runs" },
          { label: `Run ${id?.substring(0, 8) || ""}` },
        ]}
        extra={
          <Space>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              style={{ background: "#10b981", borderColor: "#10b981" }}
            >
              Approve & Merge
            </Button>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => setRejectModalOpen(true)}
            >
              Reject
            </Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <KPICard
            title="Files Changed"
            value={run?.filesChanged || mockFileChanges.length}
            icon={<FileTextOutlined />}
            color="#0f6fa8"
          />
        </Col>
        <Col span={6}>
          <KPICard
            title="Additions"
            value={run?.additions || 73}
            prefix={<PlusOutlined style={{ fontSize: 16 }} />}
            color="#10b981"
          />
        </Col>
        <Col span={6}>
          <KPICard
            title="Deletions"
            value={run?.deletions || 57}
            prefix={<MinusOutlined style={{ fontSize: 16 }} />}
            color="#ef4444"
          />
        </Col>
        <Col span={6}>
          <KPICard
            title="Cost"
            value={formatCurrency(run?.cost || 0.12)}
            color="#8b5cf6"
          />
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Descriptions column={3} size="small">
          <Descriptions.Item label="Agent">
            <Text strong>{run?.agentName || "TypeScript Refactor Bot"}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Repository">
            <Text code>{run?.repository || "org/frontend-app"}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Branch">
            <Tag style={{ fontFamily: "monospace" }}>
              {run?.branch || "auto/refactor-components"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <StatusBadge status={run?.status || "review"} />
          </Descriptions.Item>
          <Descriptions.Item label="Duration">
            {formatDuration(run?.duration || 330)}
          </Descriptions.Item>
          <Descriptions.Item label="Tokens Used">
            {formatTokens(run?.tokensUsed || 45000)}
          </Descriptions.Item>
          <Descriptions.Item label="Started">
            {formatDateTime(run?.startedAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Completed">
            {formatDateTime(run?.completedAt)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Title level={5} style={{ marginBottom: 4 }}>Task Description</Title>
        <Paragraph>{run?.task || "Refactor component tree for performance improvements. Focus on memoization, virtual scrolling, and removing legacy components."}</Paragraph>
      </Card>

      <Card title="File Changes">
        <Table
          dataSource={mockFileChanges}
          rowKey="path"
          pagination={false}
          size="small"
          style={{ marginBottom: 16 }}
          columns={[
            {
              title: "File",
              dataIndex: "path",
              key: "path",
              render: (path: string) => (
                <Text code style={{ fontSize: 13 }}>{path}</Text>
              ),
            },
            {
              title: "Type",
              dataIndex: "changeType",
              key: "changeType",
              width: 100,
              render: (type: string) => <Tag color={changeTypeColor(type)}>{type}</Tag>,
            },
            {
              title: "Changes",
              key: "changes",
              width: 120,
              render: (_: unknown, record: (typeof mockFileChanges)[0]) => (
                <Space size={4}>
                  <Text style={{ color: "#10b981", fontWeight: 600 }}>+{record.additions}</Text>
                  <Text style={{ color: "#ef4444", fontWeight: 600 }}>-{record.deletions}</Text>
                </Space>
              ),
            },
          ]}
        />

        <Divider />

        {mockFileChanges.map((file) => (
          <div key={file.path} style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
                padding: "8px 12px",
                background: "#f8fafc",
                borderRadius: 6,
              }}
            >
              <Tag color={changeTypeColor(file.changeType)}>{file.changeType}</Tag>
              <Text code strong style={{ fontSize: 13 }}>{file.path}</Text>
              <span style={{ marginLeft: "auto" }}>
                <Text style={{ color: "#10b981", fontSize: 13, fontWeight: 600 }}>+{file.additions}</Text>
                {" "}
                <Text style={{ color: "#ef4444", fontSize: 13, fontWeight: 600 }}>-{file.deletions}</Text>
              </span>
            </div>
            <div
              style={{
                background: "#1e293b",
                borderRadius: 8,
                overflow: "hidden",
                border: "1px solid #334155",
              }}
            >
              {file.patch.split("\n").map((line, idx) => {
                let bgColor = "transparent";
                let textColor = "#e2e8f0";
                if (line.startsWith("+") && !line.startsWith("+++")) {
                  bgColor = "rgba(16, 185, 129, 0.15)";
                  textColor = "#6ee7b7";
                } else if (line.startsWith("-") && !line.startsWith("---")) {
                  bgColor = "rgba(239, 68, 68, 0.15)";
                  textColor = "#fca5a5";
                } else if (line.startsWith("@@")) {
                  bgColor = "rgba(15, 111, 168, 0.15)";
                  textColor = "#7dd3fc";
                }
                return (
                  <div
                    key={idx}
                    style={{
                      fontFamily: "'SF Mono', 'Fira Code', monospace",
                      fontSize: 13,
                      lineHeight: 1.6,
                      padding: "1px 12px",
                      background: bgColor,
                      color: textColor,
                      whiteSpace: "pre",
                      borderLeft: line.startsWith("+") && !line.startsWith("+++")
                        ? "3px solid #10b981"
                        : line.startsWith("-") && !line.startsWith("---")
                        ? "3px solid #ef4444"
                        : "3px solid transparent",
                    }}
                  >
                    {line}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </Card>

      <Modal
        title="Reject Run"
        open={rejectModalOpen}
        onCancel={() => setRejectModalOpen(false)}
        onOk={() => setRejectModalOpen(false)}
        okText="Reject"
        okButtonProps={{ danger: true }}
      >
        <Paragraph>Please provide a reason for rejecting this run:</Paragraph>
        <TextArea rows={4} placeholder="Enter rejection reason..." />
      </Modal>
    </div>
  );
};
