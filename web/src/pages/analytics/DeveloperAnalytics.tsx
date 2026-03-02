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
  Select,
  Tabs,
  List,
  Avatar,
  Divider,
} from "antd";
import {
  BarChartOutlined,
  UserOutlined,
  CodeOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  RocketOutlined,
  RiseOutlined,
  FallOutlined,
  BranchesOutlined,
  DeploymentUnitOutlined,
  PieChartOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

interface DeveloperMetrics {
  name: string;
  avatar: string;
  commits: number;
  prsMerged: number;
  linesChanged: number;
  reviewComments: number;
  avgCycleTime: string;
  topLanguage: string;
}

interface CycleStage {
  stage: string;
  avgDuration: string;
  p50: string;
  p90: string;
  trend: "improving" | "stable" | "degrading";
}

interface SprintVelocity {
  sprint: string;
  planned: number;
  completed: number;
  carryOver: number;
}

interface CollabPair {
  reviewer: string;
  author: string;
  reviews: number;
  avgResponseTime: string;
}

const devMetrics: DeveloperMetrics[] = [
  { name: "Alice Chen", avatar: "AC", commits: 48, prsMerged: 12, linesChanged: 4520, reviewComments: 85, avgCycleTime: "18h", topLanguage: "TypeScript" },
  { name: "Bob Kim", avatar: "BK", commits: 35, prsMerged: 8, linesChanged: 2890, reviewComments: 62, avgCycleTime: "22h", topLanguage: "Go" },
  { name: "Charlie Davis", avatar: "CD", commits: 42, prsMerged: 10, linesChanged: 3650, reviewComments: 45, avgCycleTime: "16h", topLanguage: "TypeScript" },
  { name: "Dave Wilson", avatar: "DW", commits: 28, prsMerged: 6, linesChanged: 1980, reviewComments: 72, avgCycleTime: "25h", topLanguage: "Python" },
  { name: "Eve Taylor", avatar: "ET", commits: 55, prsMerged: 15, linesChanged: 5200, reviewComments: 38, avgCycleTime: "14h", topLanguage: "TypeScript" },
  { name: "Frank Lopez", avatar: "FL", commits: 22, prsMerged: 5, linesChanged: 1450, reviewComments: 95, avgCycleTime: "20h", topLanguage: "Go" },
];

const cycleStages: CycleStage[] = [
  { stage: "Coding", avgDuration: "6.2h", p50: "4h", p90: "12h", trend: "improving" },
  { stage: "Review", avgDuration: "4.8h", p50: "3h", p90: "10h", trend: "stable" },
  { stage: "Merge", avgDuration: "1.5h", p50: "0.5h", p90: "4h", trend: "improving" },
  { stage: "Deploy", avgDuration: "2.1h", p50: "1h", p90: "5h", trend: "degrading" },
];

const sprintVelocity: SprintVelocity[] = [
  { sprint: "Sprint 18", planned: 34, completed: 30, carryOver: 4 },
  { sprint: "Sprint 19", planned: 36, completed: 33, carryOver: 3 },
  { sprint: "Sprint 20", planned: 38, completed: 35, carryOver: 3 },
  { sprint: "Sprint 21", planned: 40, completed: 36, carryOver: 4 },
  { sprint: "Sprint 22", planned: 38, completed: 37, carryOver: 1 },
  { sprint: "Sprint 23 (current)", planned: 42, completed: 28, carryOver: 0 },
];

const collabPairs: CollabPair[] = [
  { reviewer: "Alice Chen", author: "Bob Kim", reviews: 15, avgResponseTime: "2.1h" },
  { reviewer: "Alice Chen", author: "Charlie Davis", reviews: 12, avgResponseTime: "1.8h" },
  { reviewer: "Bob Kim", author: "Eve Taylor", reviews: 10, avgResponseTime: "3.2h" },
  { reviewer: "Charlie Davis", author: "Alice Chen", reviews: 14, avgResponseTime: "2.5h" },
  { reviewer: "Dave Wilson", author: "Alice Chen", reviews: 8, avgResponseTime: "4.1h" },
  { reviewer: "Eve Taylor", author: "Bob Kim", reviews: 11, avgResponseTime: "1.5h" },
  { reviewer: "Frank Lopez", author: "Charlie Davis", reviews: 9, avgResponseTime: "2.8h" },
  { reviewer: "Eve Taylor", author: "Dave Wilson", reviews: 7, avgResponseTime: "3.0h" },
];

const languageDistribution = [
  { language: "TypeScript", percentage: 45, files: 342, color: "#3178c6" },
  { language: "Go", percentage: 28, files: 215, color: "#00add8" },
  { language: "Python", percentage: 12, files: 89, color: "#3776ab" },
  { language: "SQL", percentage: 8, files: 62, color: "#e38c00" },
  { language: "YAML/Config", percentage: 5, files: 38, color: "#cb171e" },
  { language: "Other", percentage: 2, files: 15, color: "#8c8c8c" },
];

const deploymentMetrics = [
  { week: "W5", deployments: 8, leadTime: "4.2h", failRate: 12 },
  { week: "W6", deployments: 12, leadTime: "3.8h", failRate: 8 },
  { week: "W7", deployments: 10, leadTime: "3.5h", failRate: 10 },
  { week: "W8", deployments: 15, leadTime: "3.2h", failRate: 7 },
  { week: "W9", deployments: 14, leadTime: "2.9h", failRate: 5 },
];

const DeveloperAnalytics: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState("30d");

  const totalCommits = devMetrics.reduce((s, d) => s + d.commits, 0);
  const totalPRs = devMetrics.reduce((s, d) => s + d.prsMerged, 0);
  const totalLines = devMetrics.reduce((s, d) => s + d.linesChanged, 0);
  const avgCycleTimeHours = Math.round(devMetrics.reduce((s, d) => s + parseInt(d.avgCycleTime), 0) / devMetrics.length);

  const trendColors: Record<string, string> = { improving: "#52c41a", stable: "#1890ff", degrading: "#ff4d4f" };
  const trendIcons: Record<string, React.ReactNode> = { improving: <RiseOutlined />, stable: null, degrading: <FallOutlined /> };

  const devColumns = [
    {
      title: "Developer",
      key: "name",
      render: (_: unknown, r: DeveloperMetrics) => (
        <Space>
          <Avatar style={{ backgroundColor: "#1890ff" }}>{r.avatar}</Avatar>
          <Text strong>{r.name}</Text>
        </Space>
      ),
    },
    { title: "Commits", dataIndex: "commits", key: "commits", sorter: (a: DeveloperMetrics, b: DeveloperMetrics) => a.commits - b.commits },
    { title: "PRs Merged", dataIndex: "prsMerged", key: "prsMerged", sorter: (a: DeveloperMetrics, b: DeveloperMetrics) => a.prsMerged - b.prsMerged },
    { title: "Lines Changed", dataIndex: "linesChanged", key: "linesChanged", render: (v: number) => v.toLocaleString(), sorter: (a: DeveloperMetrics, b: DeveloperMetrics) => a.linesChanged - b.linesChanged },
    { title: "Review Comments", dataIndex: "reviewComments", key: "reviewComments", sorter: (a: DeveloperMetrics, b: DeveloperMetrics) => a.reviewComments - b.reviewComments },
    { title: "Avg Cycle Time", dataIndex: "avgCycleTime", key: "avgCycleTime" },
    { title: "Top Language", dataIndex: "topLanguage", key: "topLanguage", render: (l: string) => <Tag>{l}</Tag> },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16, width: "100%", justifyContent: "space-between" }}>
        <Title level={2} style={{ margin: 0 }}><BarChartOutlined /> Developer Analytics</Title>
        <Select value={timePeriod} onChange={setTimePeriod} style={{ width: 140 }}>
          <Option value="7d">Last 7 days</Option>
          <Option value="30d">Last 30 days</Option>
          <Option value="90d">Last 90 days</Option>
        </Select>
      </Space>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="Total Commits" value={totalCommits} prefix={<CodeOutlined />} /></Card></Col>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="PRs Merged" value={totalPRs} prefix={<BranchesOutlined />} /></Card></Col>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="Lines Changed" value={totalLines} prefix={<CodeOutlined />} /></Card></Col>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="Avg Cycle Time" value={`${avgCycleTimeHours}h`} prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="Team Size" value={devMetrics.length} prefix={<TeamOutlined />} /></Card></Col>
        <Col xs={12} sm={6} md={4}><Card size="small"><Statistic title="Deploy Frequency" value="14/week" prefix={<RocketOutlined />} /></Card></Col>
      </Row>

      <Tabs
        defaultActiveKey="productivity"
        items={[
          {
            key: "productivity",
            label: <span><UserOutlined /> Developer Productivity</span>,
            children: (
              <Card>
                <Table columns={devColumns} dataSource={devMetrics} rowKey="name" size="small" pagination={false} />
              </Card>
            ),
          },
          {
            key: "cycle",
            label: <span><ClockCircleOutlined /> Cycle Time</span>,
            children: (
              <Card>
                <Row gutter={[16, 16]}>
                  {cycleStages.map((stage) => (
                    <Col xs={24} sm={12} md={6} key={stage.stage}>
                      <Card size="small" style={{ textAlign: "center" }}>
                        <Title level={4} style={{ margin: 0 }}>{stage.stage}</Title>
                        <Divider style={{ margin: "8px 0" }} />
                        <Statistic title="Average" value={stage.avgDuration} />
                        <Space style={{ marginTop: 8 }}>
                          <Text type="secondary">P50: {stage.p50}</Text>
                          <Text type="secondary">P90: {stage.p90}</Text>
                        </Space>
                        <div style={{ marginTop: 8 }}>
                          <Tag color={trendColors[stage.trend]} icon={trendIcons[stage.trend]}>
                            {stage.trend.toUpperCase()}
                          </Tag>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
                <Divider />
                <Title level={5}>End-to-End Cycle Time</Title>
                <Card size="small" style={{ background: "#fafafa" }}>
                  <Space size="large" style={{ width: "100%", justifyContent: "center" }}>
                    {cycleStages.map((stage, idx) => (
                      <React.Fragment key={stage.stage}>
                        <Space orientation="vertical" size={0} style={{ textAlign: "center" }}>
                          <Text strong>{stage.stage}</Text>
                          <Tag color="blue">{stage.avgDuration}</Tag>
                        </Space>
                        {idx < cycleStages.length - 1 && <Text type="secondary" style={{ fontSize: 20 }}>&#8594;</Text>}
                      </React.Fragment>
                    ))}
                    <Text type="secondary" style={{ fontSize: 20 }}>= </Text>
                    <Space orientation="vertical" size={0} style={{ textAlign: "center" }}>
                      <Text strong>Total</Text>
                      <Tag color="purple">14.6h</Tag>
                    </Space>
                  </Space>
                </Card>
              </Card>
            ),
          },
          {
            key: "velocity",
            label: <span><RocketOutlined /> Sprint Velocity</span>,
            children: (
              <Card>
                <Row gutter={[16, 16]}>
                  {sprintVelocity.map((sprint) => {
                    const completionRate = Math.round((sprint.completed / sprint.planned) * 100);
                    return (
                      <Col xs={12} sm={8} md={4} key={sprint.sprint}>
                        <Card size="small">
                          <Text strong style={{ display: "block", marginBottom: 8, fontSize: 12 }}>{sprint.sprint}</Text>
                          <Progress type="circle" percent={completionRate} size={70} strokeColor={completionRate >= 90 ? "#52c41a" : completionRate >= 75 ? "#faad14" : "#ff4d4f"} />
                          <div style={{ marginTop: 8 }}>
                            <Text type="secondary" style={{ fontSize: 11 }}>Planned: {sprint.planned} | Done: {sprint.completed}</Text>
                            {sprint.carryOver > 0 && <Tag color="warning" style={{ fontSize: 11 }}>+{sprint.carryOver} carry</Tag>}
                          </div>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </Card>
            ),
          },
          {
            key: "collab",
            label: <span><TeamOutlined /> Collaboration</span>,
            children: (
              <Card title="Review Network: Who Reviews Whom">
                <Table
                  dataSource={collabPairs}
                  rowKey={(r) => `${r.reviewer}-${r.author}`}
                  size="small"
                  pagination={false}
                  columns={[
                    { title: "Reviewer", dataIndex: "reviewer", key: "reviewer", render: (n: string) => <Space><Avatar size="small" style={{ backgroundColor: "#722ed1" }}>{n[0]}</Avatar><Text>{n}</Text></Space> },
                    { title: "Author", dataIndex: "author", key: "author", render: (n: string) => <Space><Avatar size="small" style={{ backgroundColor: "#13c2c2" }}>{n[0]}</Avatar><Text>{n}</Text></Space> },
                    { title: "Reviews", dataIndex: "reviews", key: "reviews", sorter: (a: CollabPair, b: CollabPair) => a.reviews - b.reviews },
                    { title: "Avg Response", dataIndex: "avgResponseTime", key: "avgResponseTime" },
                  ]}
                />
              </Card>
            ),
          },
          {
            key: "languages",
            label: <span><PieChartOutlined /> Languages</span>,
            children: (
              <Card>
                <Row gutter={[16, 16]}>
                  {languageDistribution.map((lang) => (
                    <Col xs={12} sm={8} md={4} key={lang.language}>
                      <Card size="small" style={{ textAlign: "center" }}>
                        <Progress type="circle" percent={lang.percentage} size={70} strokeColor={lang.color} format={(v) => `${v}%`} />
                        <div style={{ marginTop: 8 }}>
                          <Text strong>{lang.language}</Text>
                          <br />
                          <Text type="secondary">{lang.files} files</Text>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            ),
          },
          {
            key: "deployments",
            label: <span><DeploymentUnitOutlined /> Deployments</span>,
            children: (
              <Card>
                <Row gutter={[16, 16]}>
                  {deploymentMetrics.map((item) => (
                    <Col xs={12} sm={8} md={4} key={item.week}>
                      <Card size="small">
                        <Text strong style={{ display: "block", marginBottom: 4 }}>{item.week}</Text>
                        <Space orientation="vertical" size={4} style={{ width: "100%" }}>
                          <div><Text type="secondary">Deploys: </Text><Text strong>{item.deployments}</Text></div>
                          <div><Text type="secondary">Lead Time: </Text><Text>{item.leadTime}</Text></div>
                          <div>
                            <Text type="secondary">Fail Rate: </Text>
                            <Text style={{ color: item.failRate > 10 ? "#ff4d4f" : "#52c41a" }}>{item.failRate}%</Text>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

export default DeveloperAnalytics;
