import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Tag,
  Space,
  Statistic,
  Progress,
  Input,
  Tabs,
  List,
  Divider,
  Badge,
  Collapse,
} from "antd";
import {
  FileTextOutlined,
  SearchOutlined,
  ApiOutlined,
  CodeOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClusterOutlined,
  StarOutlined,
  LinkOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

interface APIEndpoint {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  parameters: { name: string; type: string; required: boolean; description: string }[];
  documented: boolean;
  tags: string[];
}

interface DocModule {
  name: string;
  type: "module" | "class" | "interface";
  functions: number;
  documented: number;
  coverage: number;
  lastUpdated: string;
}

interface ReadmeScore {
  repo: string;
  score: number;
  sections: { name: string; present: boolean }[];
  lastUpdated: string;
}

const demoEndpoints: APIEndpoint[] = [
  { id: "E001", method: "GET", path: "/api/v1/agents", description: "List all coding agents", parameters: [{ name: "status", type: "string", required: false, description: "Filter by agent status" }, { name: "limit", type: "number", required: false, description: "Max results" }], documented: true, tags: ["agents"] },
  { id: "E002", method: "POST", path: "/api/v1/agents", description: "Create a new coding agent", parameters: [{ name: "name", type: "string", required: true, description: "Agent name" }, { name: "type", type: "string", required: true, description: "Agent type" }], documented: true, tags: ["agents"] },
  { id: "E003", method: "GET", path: "/api/v1/agents/:id", description: "Get agent by ID", parameters: [{ name: "id", type: "string", required: true, description: "Agent UUID" }], documented: true, tags: ["agents"] },
  { id: "E004", method: "POST", path: "/api/v1/runs", description: "Start a new coding run", parameters: [{ name: "agentId", type: "string", required: true, description: "Agent to assign" }, { name: "task", type: "string", required: true, description: "Task description" }], documented: true, tags: ["runs"] },
  { id: "E005", method: "GET", path: "/api/v1/runs/:id", description: "Get run details and output", parameters: [{ name: "id", type: "string", required: true, description: "Run UUID" }], documented: true, tags: ["runs"] },
  { id: "E006", method: "GET", path: "/api/v1/reviews", description: "List code reviews", parameters: [{ name: "status", type: "string", required: false, description: "Filter by review status" }], documented: true, tags: ["reviews"] },
  { id: "E007", method: "POST", path: "/api/v1/reviews/:id/approve", description: "Approve a code review", parameters: [{ name: "id", type: "string", required: true, description: "Review UUID" }], documented: false, tags: ["reviews"] },
  { id: "E008", method: "GET", path: "/api/v1/pipelines", description: "List CI/CD pipelines", parameters: [{ name: "repo", type: "string", required: false, description: "Filter by repo" }], documented: true, tags: ["pipelines"] },
  { id: "E009", method: "POST", path: "/api/v1/pipelines/:id/trigger", description: "Manually trigger a pipeline", parameters: [{ name: "id", type: "string", required: true, description: "Pipeline UUID" }, { name: "branch", type: "string", required: false, description: "Branch name" }], documented: false, tags: ["pipelines"] },
  { id: "E010", method: "GET", path: "/api/v1/approvals", description: "List pending approvals", parameters: [], documented: true, tags: ["approvals"] },
  { id: "E011", method: "PATCH", path: "/api/v1/approvals/:id", description: "Update approval decision", parameters: [{ name: "id", type: "string", required: true, description: "Approval UUID" }, { name: "decision", type: "string", required: true, description: "approved|rejected" }], documented: false, tags: ["approvals"] },
  { id: "E012", method: "GET", path: "/api/v1/metrics/quality", description: "Get code quality metrics", parameters: [{ name: "repo", type: "string", required: false, description: "Filter by repo" }], documented: true, tags: ["metrics"] },
];

const demoModules: DocModule[] = [
  { name: "AgentPool", type: "class", functions: 12, documented: 10, coverage: 83, lastUpdated: "2026-02-28" },
  { name: "RunScheduler", type: "class", functions: 8, documented: 7, coverage: 88, lastUpdated: "2026-02-27" },
  { name: "CodeReviewEngine", type: "module", functions: 15, documented: 12, coverage: 80, lastUpdated: "2026-02-26" },
  { name: "PipelineOrchestrator", type: "class", functions: 10, documented: 6, coverage: 60, lastUpdated: "2026-02-25" },
  { name: "AuthProvider", type: "interface", functions: 6, documented: 6, coverage: 100, lastUpdated: "2026-02-24" },
  { name: "BillingCalculator", type: "class", functions: 9, documented: 5, coverage: 56, lastUpdated: "2026-02-23" },
  { name: "WebhookHandler", type: "module", functions: 7, documented: 4, coverage: 57, lastUpdated: "2026-02-22" },
  { name: "DataProvider", type: "interface", functions: 8, documented: 8, coverage: 100, lastUpdated: "2026-02-21" },
  { name: "NotificationService", type: "class", functions: 5, documented: 3, coverage: 60, lastUpdated: "2026-02-20" },
  { name: "TenantResolver", type: "module", functions: 4, documented: 4, coverage: 100, lastUpdated: "2026-02-19" },
];

const demoReadmeScores: ReadmeScore[] = [
  {
    repo: "erp-platform",
    score: 92,
    sections: [
      { name: "Title & Description", present: true }, { name: "Installation", present: true },
      { name: "Usage", present: true }, { name: "API Reference", present: true },
      { name: "Configuration", present: true }, { name: "Contributing", present: true },
      { name: "License", present: true }, { name: "Changelog", present: false },
    ],
    lastUpdated: "2026-02-28",
  },
  {
    repo: "erp-agents",
    score: 78,
    sections: [
      { name: "Title & Description", present: true }, { name: "Installation", present: true },
      { name: "Usage", present: true }, { name: "API Reference", present: false },
      { name: "Configuration", present: true }, { name: "Contributing", present: false },
      { name: "License", present: true }, { name: "Changelog", present: false },
    ],
    lastUpdated: "2026-02-25",
  },
  {
    repo: "erp-billing",
    score: 65,
    sections: [
      { name: "Title & Description", present: true }, { name: "Installation", present: true },
      { name: "Usage", present: false }, { name: "API Reference", present: false },
      { name: "Configuration", present: true }, { name: "Contributing", present: false },
      { name: "License", present: true }, { name: "Changelog", present: false },
    ],
    lastUpdated: "2026-02-15",
  },
  {
    repo: "erp-gateway",
    score: 85,
    sections: [
      { name: "Title & Description", present: true }, { name: "Installation", present: true },
      { name: "Usage", present: true }, { name: "API Reference", present: true },
      { name: "Configuration", present: true }, { name: "Contributing", present: false },
      { name: "License", present: true }, { name: "Changelog", present: true },
    ],
    lastUpdated: "2026-02-22",
  },
  {
    repo: "erp-webhooks",
    score: 48,
    sections: [
      { name: "Title & Description", present: true }, { name: "Installation", present: true },
      { name: "Usage", present: false }, { name: "API Reference", present: false },
      { name: "Configuration", present: false }, { name: "Contributing", present: false },
      { name: "License", present: false }, { name: "Changelog", present: false },
    ],
    lastUpdated: "2026-01-10",
  },
];

const methodColors: Record<string, string> = { GET: "blue", POST: "green", PUT: "orange", DELETE: "red", PATCH: "purple" };

const DocumentationHub: React.FC = () => {
  const [searchText, setSearchText] = useState("");

  const filteredEndpoints = demoEndpoints.filter(
    (ep) =>
      ep.path.toLowerCase().includes(searchText.toLowerCase()) ||
      ep.description.toLowerCase().includes(searchText.toLowerCase())
  );

  const totalEndpoints = demoEndpoints.length;
  const documentedEndpoints = demoEndpoints.filter((e) => e.documented).length;
  const apiCoverage = Math.round((documentedEndpoints / totalEndpoints) * 100);
  const totalFunctions = demoModules.reduce((s, m) => s + m.functions, 0);
  const documentedFunctions = demoModules.reduce((s, m) => s + m.documented, 0);
  const codeCoverage = Math.round((documentedFunctions / totalFunctions) * 100);
  const avgReadmeScore = Math.round(demoReadmeScores.reduce((s, r) => s + r.score, 0) / demoReadmeScores.length);

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}><BookOutlined /> Documentation Hub</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="API Endpoints" value={totalEndpoints} prefix={<ApiOutlined />} /></Card></Col>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="API Doc Coverage" value={apiCoverage} suffix="%" valueStyle={{ color: apiCoverage >= 80 ? "#52c41a" : "#faad14" }} /></Card></Col>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="Code Doc Coverage" value={codeCoverage} suffix="%" valueStyle={{ color: codeCoverage >= 80 ? "#52c41a" : "#faad14" }} /></Card></Col>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="Modules" value={demoModules.length} prefix={<CodeOutlined />} /></Card></Col>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="Avg README Score" value={avgReadmeScore} suffix="/100" prefix={<StarOutlined />} /></Card></Col>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="Undocumented APIs" value={totalEndpoints - documentedEndpoints} valueStyle={{ color: "#ff4d4f" }} prefix={<ExclamationCircleOutlined />} /></Card></Col>
      </Row>

      <Tabs
        defaultActiveKey="api"
        items={[
          {
            key: "api",
            label: <span><ApiOutlined /> API Documentation</span>,
            children: (
              <Card>
                <Input placeholder="Search endpoints..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 400, marginBottom: 16 }} allowClear />
                <Collapse
                  items={["agents", "runs", "reviews", "pipelines", "approvals", "metrics"].map((tag) => {
                    const tagEndpoints = filteredEndpoints.filter((ep) => ep.tags.includes(tag));
                    return {
                      key: tag,
                      label: (
                        <Space>
                          <Text strong style={{ textTransform: "capitalize" }}>{tag}</Text>
                          <Tag>{tagEndpoints.length} endpoints</Tag>
                        </Space>
                      ),
                      children: (
                        <List
                          dataSource={tagEndpoints}
                          size="small"
                          renderItem={(ep) => (
                            <List.Item>
                              <Space orientation="vertical" style={{ width: "100%" }} size={4}>
                                <Space>
                                  <Tag color={methodColors[ep.method]} style={{ fontFamily: "monospace", fontWeight: 600 }}>{ep.method}</Tag>
                                  <Text code>{ep.path}</Text>
                                  {!ep.documented && <Tag color="warning" icon={<ExclamationCircleOutlined />}>Undocumented</Tag>}
                                </Space>
                                <Text type="secondary">{ep.description}</Text>
                                {ep.parameters.length > 0 && (
                                  <Space wrap size={4}>
                                    {ep.parameters.map((p) => (
                                      <Tag key={p.name} color={p.required ? "blue" : "default"}>
                                        {p.name}: {p.type} {p.required && "*"}
                                      </Tag>
                                    ))}
                                  </Space>
                                )}
                              </Space>
                            </List.Item>
                          )}
                        />
                      ),
                    };
                  })}
                />
              </Card>
            ),
          },
          {
            key: "code",
            label: <span><CodeOutlined /> Code Documentation</span>,
            children: (
              <Card>
                <Table
                  dataSource={demoModules}
                  rowKey="name"
                  size="small"
                  pagination={false}
                  columns={[
                    { title: "Module", dataIndex: "name", key: "name", render: (n: string) => <Text strong>{n}</Text> },
                    { title: "Type", dataIndex: "type", key: "type", render: (t: string) => <Tag>{t}</Tag> },
                    { title: "Functions", dataIndex: "functions", key: "functions" },
                    { title: "Documented", dataIndex: "documented", key: "documented" },
                    {
                      title: "Coverage",
                      dataIndex: "coverage",
                      key: "coverage",
                      render: (c: number) => (
                        <Progress percent={c} size="small" strokeColor={c >= 80 ? "#52c41a" : c >= 60 ? "#faad14" : "#ff4d4f"} style={{ width: 120 }} />
                      ),
                      sorter: (a: DocModule, b: DocModule) => a.coverage - b.coverage,
                    },
                    { title: "Last Updated", dataIndex: "lastUpdated", key: "lastUpdated" },
                  ]}
                />
              </Card>
            ),
          },
          {
            key: "architecture",
            label: <span><ClusterOutlined /> Architecture</span>,
            children: (
              <Card>
                <Row gutter={[16, 16]}>
                  {[
                    { name: "System Overview", desc: "High-level architecture diagram showing all services and their relationships", status: "available" },
                    { name: "Data Flow", desc: "How data flows through the system from API to database", status: "available" },
                    { name: "Deployment Topology", desc: "Infrastructure layout with containers, load balancers, databases", status: "outdated" },
                    { name: "Security Architecture", desc: "Authentication, authorization, and encryption boundaries", status: "available" },
                    { name: "Event-Driven Architecture", desc: "Message queues, event bus, and async processing flows", status: "missing" },
                    { name: "Database Schema", desc: "Entity relationship diagrams for all services", status: "outdated" },
                  ].map((diag) => (
                    <Col xs={24} sm={12} md={8} key={diag.name}>
                      <Card size="small" hoverable>
                        <Space orientation="vertical" style={{ width: "100%" }}>
                          <Space>
                            <ClusterOutlined style={{ fontSize: 20, color: "#1890ff" }} />
                            <Text strong>{diag.name}</Text>
                          </Space>
                          <Text type="secondary">{diag.desc}</Text>
                          <Tag color={diag.status === "available" ? "success" : diag.status === "outdated" ? "warning" : "error"}>
                            {diag.status.toUpperCase()}
                          </Tag>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            ),
          },
          {
            key: "readme",
            label: <span><FileTextOutlined /> README Quality</span>,
            children: (
              <Card>
                <Row gutter={[16, 16]}>
                  {demoReadmeScores.map((readme) => (
                    <Col xs={24} sm={12} key={readme.repo}>
                      <Card size="small" title={<Text strong>{readme.repo}</Text>} extra={<Text type="secondary">Updated: {readme.lastUpdated}</Text>}>
                        <div style={{ textAlign: "center", marginBottom: 12 }}>
                          <Progress type="circle" percent={readme.score} size={80} strokeColor={readme.score >= 80 ? "#52c41a" : readme.score >= 60 ? "#faad14" : "#ff4d4f"} />
                        </div>
                        <Divider style={{ margin: "8px 0" }} />
                        <Space wrap size={[4, 4]}>
                          {readme.sections.map((sec) => (
                            <Tag key={sec.name} color={sec.present ? "success" : "default"} icon={sec.present ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}>
                              {sec.name}
                            </Tag>
                          ))}
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            ),
          },
          {
            key: "search",
            label: <span><SearchOutlined /> Search Docs</span>,
            children: (
              <Card>
                <Input.Search placeholder="Search across all documentation..." enterButton="Search" size="large" style={{ maxWidth: 600, marginBottom: 24 }} />
                <List
                  dataSource={[
                    { title: "Agent Pool Configuration", source: "Code Docs / AgentPool", snippet: "Configure the agent pool size and timeout settings for optimal performance..." },
                    { title: "GET /api/v1/agents", source: "API Reference", snippet: "Returns a list of all registered coding agents with their current status..." },
                    { title: "Authentication Setup", source: "README / erp-platform", snippet: "Configure OAuth2 with your identity provider by setting the following..." },
                    { title: "Pipeline Configuration", source: "Code Docs / PipelineOrchestrator", snippet: "Define pipeline stages and their execution order in the YAML config..." },
                    { title: "Webhook Retry Logic", source: "Code Docs / WebhookHandler", snippet: "Failed webhook deliveries are retried with exponential backoff..." },
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<BookOutlined style={{ fontSize: 20, color: "#1890ff" }} />}
                        title={<><Text strong>{item.title}</Text> <Tag style={{ fontSize: 11 }}>{item.source}</Tag></>}
                        description={item.snippet}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

export default DocumentationHub;
