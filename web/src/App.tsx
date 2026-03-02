import React, { lazy, Suspense } from "react";
import { Refine } from "@refinedev/core";
import { useNotificationProvider } from "@refinedev/antd";
import routerProvider from "@refinedev/react-router-v6";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfigProvider, App as AntApp, Spin } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  DashboardOutlined,
  RobotOutlined,
  PlayCircleOutlined,
  CodeOutlined,
  CheckCircleOutlined,
  DeploymentUnitOutlined,
} from "@ant-design/icons";

import { theme } from "./theme";
import { authProvider } from "./authProvider";
import { dataProvider } from "./providers/hasuraDataProvider";
import { liveProvider } from "./providers/hasuraLiveProvider";
import { MainLayout } from "./components/Layout/MainLayout";

import "@refinedev/antd/dist/reset.css";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const AgentList = lazy(() => import("./pages/agents/AgentList"));
const AgentShow = lazy(() => import("./pages/agents/AgentShow"));
const AgentCreate = lazy(() => import("./pages/agents/AgentCreate"));
const RunList = lazy(() => import("./pages/runs/RunList"));
const RunShow = lazy(() => import("./pages/runs/RunShow"));
const CodeReviewList = lazy(() => import("./pages/reviews/CodeReviewList"));
const CodeReviewShow = lazy(() => import("./pages/reviews/CodeReviewShow"));
const ApprovalList = lazy(() => import("./pages/approvals/ApprovalList"));
const ApprovalShow = lazy(() => import("./pages/approvals/ApprovalShow"));
const PipelineList = lazy(() => import("./pages/pipelines/PipelineList"));
const PipelineShow = lazy(() => import("./pages/pipelines/PipelineShow"));
const CodeReview = lazy(() => import("./pages/reviews/CodeReview"));
const CodeQuality = lazy(() => import("./pages/quality/CodeQuality"));
const PipelineInsights = lazy(() => import("./pages/pipelines/PipelineInsights"));
const SecurityScanner = lazy(() => import("./pages/security/SecurityScanner"));
const DocumentationHub = lazy(() => import("./pages/docs/DocumentationHub"));
const DeveloperAnalytics = lazy(() => import("./pages/analytics/DeveloperAnalytics"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const Loading: React.FC = () => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
    <Spin size="large" />
  </div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider theme={theme}>
          <AntApp>
            <Refine
              routerProvider={routerProvider}
              dataProvider={dataProvider}
              liveProvider={liveProvider}
              authProvider={authProvider}
              notificationProvider={useNotificationProvider}
              resources={[
                {
                  name: "dashboard",
                  list: "/",
                  meta: {
                    label: "Dashboard",
                    icon: <DashboardOutlined />,
                  },
                },
                {
                  name: "agents",
                  list: "/agents",
                  show: "/agents/:id",
                  create: "/agents/create",
                  meta: {
                    label: "Agents",
                    icon: <RobotOutlined />,
                  },
                },
                {
                  name: "runs",
                  list: "/runs",
                  show: "/runs/:id",
                  meta: {
                    label: "Runs",
                    icon: <PlayCircleOutlined />,
                  },
                },
                {
                  name: "reviews",
                  list: "/reviews",
                  show: "/reviews/:id",
                  meta: {
                    label: "Code Reviews",
                    icon: <CodeOutlined />,
                  },
                },
                {
                  name: "approvals",
                  list: "/approvals",
                  show: "/approvals/:id",
                  meta: {
                    label: "Approvals",
                    icon: <CheckCircleOutlined />,
                  },
                },
                {
                  name: "pipelines",
                  list: "/pipelines",
                  show: "/pipelines/:id",
                  meta: {
                    label: "Pipelines",
                    icon: <DeploymentUnitOutlined />,
                  },
                },
                {
                  name: "code-review",
                  list: "/code-review",
                  meta: { label: "Code Review" },
                },
                {
                  name: "code-quality",
                  list: "/code-quality",
                  meta: { label: "Code Quality" },
                },
                {
                  name: "pipeline-insights",
                  list: "/pipeline-insights",
                  meta: { label: "Pipeline Insights" },
                },
                {
                  name: "security-scanner",
                  list: "/security-scanner",
                  meta: { label: "Security Scanner" },
                },
                {
                  name: "documentation",
                  list: "/documentation",
                  meta: { label: "Documentation" },
                },
                {
                  name: "developer-analytics",
                  list: "/developer-analytics",
                  meta: { label: "Developer Analytics" },
                },
              ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
              }}
            >
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route element={<MainLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="/agents">
                      <Route index element={<AgentList />} />
                      <Route path="create" element={<AgentCreate />} />
                      <Route path=":id" element={<AgentShow />} />
                    </Route>
                    <Route path="/runs">
                      <Route index element={<RunList />} />
                      <Route path=":id" element={<RunShow />} />
                    </Route>
                    <Route path="/reviews">
                      <Route index element={<CodeReviewList />} />
                      <Route path=":id" element={<CodeReviewShow />} />
                    </Route>
                    <Route path="/approvals">
                      <Route index element={<ApprovalList />} />
                      <Route path=":id" element={<ApprovalShow />} />
                    </Route>
                    <Route path="/pipelines">
                      <Route index element={<PipelineList />} />
                      <Route path=":id" element={<PipelineShow />} />
                    </Route>
                    <Route path="/code-review" element={<CodeReview />} />
                    <Route path="/code-quality" element={<CodeQuality />} />
                    <Route path="/pipeline-insights" element={<PipelineInsights />} />
                    <Route path="/security-scanner" element={<SecurityScanner />} />
                    <Route path="/documentation" element={<DocumentationHub />} />
                    <Route path="/developer-analytics" element={<DeveloperAnalytics />} />
                  </Route>
                </Routes>
              </Suspense>
            </Refine>
          </AntApp>
        </ConfigProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
