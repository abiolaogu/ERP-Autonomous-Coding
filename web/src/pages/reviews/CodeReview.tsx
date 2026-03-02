import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Tag,
  Button,
  Space,
  Statistic,
  Select,
  Input,
  Drawer,
  Tabs,
  List,
  Avatar,
  Divider,
  Badge,
  Progress,
  Tooltip,
} from "antd";
import {
  CodeOutlined,
  SearchOutlined,
  UserOutlined,
  FileTextOutlined,
  PlusOutlined,
  MinusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  BugOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  MessageOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface PullRequest {
  id: string;
  title: string;
  repo: string;
  author: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  status: "pending" | "approved" | "changes-requested";
  reviewers: string[];
  created: string;
  labels: string[];
  comments: number;
}

interface AIFinding {
  id: string;
  file: string;
  line: number;
  category: "quality" | "security" | "performance";
  severity: "critical" | "high" | "medium" | "low";
  message: string;
  suggestion: string;
}

interface DiffFile {
  name: string;
  additions: number;
  deletions: number;
  hunks: { oldStart: number; newStart: number; lines: { type: "add" | "remove" | "context"; content: string }[] }[];
}

const demoPRs: PullRequest[] = [
  { id: "PR-342", title: "feat: Add real-time pipeline monitoring", repo: "erp-platform", author: "alice", filesChanged: 12, additions: 845, deletions: 124, status: "pending", reviewers: ["bob", "charlie"], created: "2026-02-28 09:15", labels: ["feature", "frontend"], comments: 5 },
  { id: "PR-341", title: "fix: Resolve memory leak in agent pool", repo: "erp-agents", author: "bob", filesChanged: 4, additions: 67, deletions: 42, status: "approved", reviewers: ["alice"], created: "2026-02-27 16:30", labels: ["bugfix", "critical"], comments: 8 },
  { id: "PR-340", title: "refactor: Extract auth middleware", repo: "erp-platform", author: "charlie", filesChanged: 8, additions: 312, deletions: 289, status: "changes-requested", reviewers: ["alice", "dave"], created: "2026-02-27 14:00", labels: ["refactor"], comments: 12 },
  { id: "PR-339", title: "feat: Implement webhook retry logic", repo: "erp-webhooks", author: "dave", filesChanged: 6, additions: 234, deletions: 18, status: "pending", reviewers: ["bob"], created: "2026-02-27 11:45", labels: ["feature", "backend"], comments: 3 },
  { id: "PR-338", title: "test: Add integration tests for billing", repo: "erp-billing", author: "eve", filesChanged: 15, additions: 1240, deletions: 45, status: "approved", reviewers: ["charlie", "alice"], created: "2026-02-26 17:20", labels: ["test"], comments: 6 },
  { id: "PR-337", title: "fix: CORS headers for GraphQL endpoint", repo: "erp-gateway", author: "alice", filesChanged: 2, additions: 28, deletions: 5, status: "approved", reviewers: ["dave"], created: "2026-02-26 14:10", labels: ["bugfix", "api"], comments: 2 },
  { id: "PR-336", title: "feat: Multi-tenant query isolation", repo: "erp-platform", author: "bob", filesChanged: 18, additions: 956, deletions: 234, status: "pending", reviewers: ["alice", "charlie", "dave"], created: "2026-02-26 10:00", labels: ["feature", "security"], comments: 15 },
  { id: "PR-335", title: "docs: Update API reference", repo: "erp-docs", author: "charlie", filesChanged: 22, additions: 1456, deletions: 890, status: "approved", reviewers: ["eve"], created: "2026-02-25 16:00", labels: ["docs"], comments: 1 },
];

const aiFindings: AIFinding[] = [
  { id: "F001", file: "src/agents/pool.ts", line: 45, category: "quality", severity: "high", message: "Unused promise result - potential unhandled rejection", suggestion: "Add await keyword or .catch() handler" },
  { id: "F002", file: "src/auth/middleware.ts", line: 78, category: "security", severity: "critical", message: "SQL injection vulnerability in dynamic query", suggestion: "Use parameterized queries instead of string interpolation" },
  { id: "F003", file: "src/billing/calculator.ts", line: 112, category: "performance", severity: "medium", message: "N+1 query pattern detected in billing loop", suggestion: "Batch database queries using DataLoader or similar" },
  { id: "F004", file: "src/webhooks/retry.ts", line: 23, category: "quality", severity: "low", message: "Magic number 3 used for retry count", suggestion: "Extract to named constant MAX_RETRIES" },
  { id: "F005", file: "src/auth/middleware.ts", line: 34, category: "security", severity: "high", message: "JWT token not validated against issuer", suggestion: "Add issuer validation to JWT verification options" },
  { id: "F006", file: "src/agents/pool.ts", line: 89, category: "performance", severity: "high", message: "Synchronous file read in async context", suggestion: "Use fs.promises.readFile instead of fs.readFileSync" },
  { id: "F007", file: "src/billing/calculator.ts", line: 45, category: "quality", severity: "medium", message: "Function exceeds 50 lines, consider splitting", suggestion: "Extract calculation logic into smaller pure functions" },
];

const demoDiffFiles: DiffFile[] = [
  {
    name: "src/agents/pool.ts",
    additions: 34,
    deletions: 12,
    hunks: [
      {
        oldStart: 40, newStart: 40,
        lines: [
          { type: "context", content: "  async acquireAgent(taskId: string) {" },
          { type: "remove", content: "    const agent = this.pool.find(a => a.idle);" },
          { type: "add", content: "    const agent = await this.pool.findAvailable(taskId);" },
          { type: "add", content: "    if (!agent) {" },
          { type: "add", content: "      throw new AgentPoolExhaustedError(taskId);" },
          { type: "add", content: "    }" },
          { type: "context", content: "    agent.assignTask(taskId);" },
          { type: "context", content: "    return agent;" },
        ],
      },
    ],
  },
  {
    name: "src/agents/types.ts",
    additions: 8,
    deletions: 0,
    hunks: [
      {
        oldStart: 1, newStart: 1,
        lines: [
          { type: "context", content: "export interface AgentPool {" },
          { type: "add", content: "  findAvailable(taskId: string): Promise<Agent | null>;" },
          { type: "add", content: "  getUtilization(): number;" },
          { type: "context", content: "  acquire(taskId: string): Promise<Agent>;" },
        ],
      },
    ],
  },
];

const CodeReview: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedPR, setSelectedPR] = useState<PullRequest | null>(null);
  const [diffTab, setDiffTab] = useState("files");

  const filtered = demoPRs.filter((pr) => {
    const matchSearch = pr.title.toLowerCase().includes(searchText.toLowerCase()) || pr.repo.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = filterStatus === "all" || pr.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const pendingCount = demoPRs.filter((p) => p.status === "pending").length;
  const approvedCount = demoPRs.filter((p) => p.status === "approved").length;
  const changesCount = demoPRs.filter((p) => p.status === "changes-requested").length;
  const avgReviewTime = "4.2h";

  const statusColors: Record<string, string> = { pending: "warning", approved: "success", "changes-requested": "error" };
  const severityColors: Record<string, string> = { critical: "red", high: "orange", medium: "gold", low: "blue" };
  const categoryIcons: Record<string, React.ReactNode> = {
    quality: <CodeOutlined />,
    security: <SafetyCertificateOutlined />,
    performance: <ThunderboltOutlined />,
  };

  const columns = [
    {
      title: "PR",
      key: "pr",
      width: 400,
      render: (_: unknown, r: PullRequest) => (
        <Space orientation="vertical" size={0}>
          <Space>
            <Text strong style={{ color: "#1890ff", cursor: "pointer" }} onClick={() => setSelectedPR(r)}>{r.id}</Text>
            <Text strong>{r.title}</Text>
          </Space>
          <Space size={4}>
            <Text type="secondary" style={{ fontSize: 12 }}>{r.repo}</Text>
            {r.labels.map((l) => <Tag key={l} style={{ fontSize: 11 }}>{l}</Tag>)}
          </Space>
        </Space>
      ),
    },
    {
      title: "Author",
      dataIndex: "author",
      key: "author",
      render: (a: string) => <Space><Avatar size="small" icon={<UserOutlined />} /><Text>{a}</Text></Space>,
    },
    {
      title: "Changes",
      key: "changes",
      render: (_: unknown, r: PullRequest) => (
        <Space>
          <Text>{r.filesChanged} files</Text>
          <Text style={{ color: "#52c41a" }}>+{r.additions}</Text>
          <Text style={{ color: "#ff4d4f" }}>-{r.deletions}</Text>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: string) => <Tag color={statusColors[s]}>{s.toUpperCase().replace("-", " ")}</Tag>,
    },
    {
      title: "Reviewers",
      dataIndex: "reviewers",
      key: "reviewers",
      render: (reviewers: string[]) => (
        <Avatar.Group maxCount={3} size="small">
          {reviewers.map((r) => <Tooltip key={r} title={r}><Avatar size="small">{r[0].toUpperCase()}</Avatar></Tooltip>)}
        </Avatar.Group>
      ),
    },
    {
      title: "",
      key: "comments",
      width: 60,
      render: (_: unknown, r: PullRequest) => (
        <Badge count={r.comments} size="small"><MessageOutlined style={{ fontSize: 16 }} /></Badge>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, r: PullRequest) => (
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setSelectedPR(r)}>Review</Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}><CodeOutlined /> Code Review</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="Pending Reviews" value={pendingCount} valueStyle={{ color: "#faad14" }} prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="Approved" value={approvedCount} valueStyle={{ color: "#52c41a" }} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="Changes Requested" value={changesCount} valueStyle={{ color: "#ff4d4f" }} prefix={<ExclamationCircleOutlined />} /></Card></Col>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="Avg Review Time" value={avgReviewTime} prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="Review Throughput" value="12/week" prefix={<CodeOutlined />} /></Card></Col>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="Review Coverage" value="94%" prefix={<CheckCircleOutlined />} /></Card></Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input placeholder="Search PRs..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 300 }} allowClear />
          <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 180 }}>
            <Option value="all">All Statuses</Option>
            <Option value="pending">Pending</Option>
            <Option value="approved">Approved</Option>
            <Option value="changes-requested">Changes Requested</Option>
          </Select>
        </Space>
      </Card>

      <Card title="Pull Request Queue">
        <Table columns={columns} dataSource={filtered} rowKey="id" size="small" pagination={{ pageSize: 8 }} />
      </Card>

      <Drawer
        title={selectedPR ? `${selectedPR.id}: ${selectedPR.title}` : ""}
        open={!!selectedPR}
        onClose={() => setSelectedPR(null)}
        width={720}
      >
        {selectedPR && (
          <Tabs
            activeKey={diffTab}
            onChange={setDiffTab}
            items={[
              {
                key: "files",
                label: `Files (${selectedPR.filesChanged})`,
                children: (
                  <>
                    {demoDiffFiles.map((file) => (
                      <Card key={file.name} size="small" title={<Space><FileTextOutlined /><Text code>{file.name}</Text><Text style={{ color: "#52c41a" }}>+{file.additions}</Text><Text style={{ color: "#ff4d4f" }}>-{file.deletions}</Text></Space>} style={{ marginBottom: 16 }}>
                        {file.hunks.map((hunk, hi) => (
                          <pre key={hi} style={{ fontSize: 12, lineHeight: 1.6, margin: 0, padding: 8, background: "#fafafa", borderRadius: 4, overflow: "auto" }}>
                            {hunk.lines.map((line, li) => (
                              <div
                                key={li}
                                style={{
                                  backgroundColor: line.type === "add" ? "#e6ffed" : line.type === "remove" ? "#ffeef0" : "transparent",
                                  padding: "0 8px",
                                  fontFamily: "monospace",
                                }}
                              >
                                <Text type="secondary" style={{ display: "inline-block", width: 16 }}>
                                  {line.type === "add" ? "+" : line.type === "remove" ? "-" : " "}
                                </Text>
                                {line.content}
                              </div>
                            ))}
                          </pre>
                        ))}
                      </Card>
                    ))}
                  </>
                ),
              },
              {
                key: "ai",
                label: (
                  <Badge count={aiFindings.length} size="small" offset={[8, 0]}>
                    <span>AI Suggestions</span>
                  </Badge>
                ),
                children: (
                  <List
                    dataSource={aiFindings}
                    renderItem={(finding) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar size="small" icon={categoryIcons[finding.category]} style={{ backgroundColor: severityColors[finding.severity] === "red" ? "#ff4d4f" : severityColors[finding.severity] === "orange" ? "#fa8c16" : severityColors[finding.severity] === "gold" ? "#faad14" : "#1890ff" }} />}
                          title={
                            <Space>
                              <Tag color={severityColors[finding.severity]}>{finding.severity.toUpperCase()}</Tag>
                              <Text code style={{ fontSize: 12 }}>{finding.file}:{finding.line}</Text>
                            </Space>
                          }
                          description={
                            <>
                              <Text>{finding.message}</Text>
                              <br />
                              <Text type="success" style={{ fontSize: 12 }}>Suggestion: {finding.suggestion}</Text>
                            </>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ),
              },
              {
                key: "metrics",
                label: "Metrics",
                children: (
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Card size="small" title="Review Size">
                        <Statistic title="Files Changed" value={selectedPR.filesChanged} />
                        <Space style={{ marginTop: 8 }}>
                          <Statistic title="Additions" value={selectedPR.additions} valueStyle={{ color: "#52c41a", fontSize: 16 }} />
                          <Statistic title="Deletions" value={selectedPR.deletions} valueStyle={{ color: "#ff4d4f", fontSize: 16 }} />
                        </Space>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card size="small" title="Review Activity">
                        <Statistic title="Comments" value={selectedPR.comments} />
                        <Statistic title="Reviewers" value={selectedPR.reviewers.length} style={{ marginTop: 8 }} />
                      </Card>
                    </Col>
                  </Row>
                ),
              },
            ]}
          />
        )}
      </Drawer>
    </div>
  );
};

export default CodeReview;
