import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Refine } from "@refinedev/core";
import { RefineThemes, useNotificationProvider } from "@refinedev/antd";
import routerProvider from "@refinedev/react-router-v6";
import { App as AntdApp, ConfigProvider } from "antd";
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
import { dataProvider } from "./dataProvider";
import { MainLayout } from "./components/Layout/MainLayout";

import { Dashboard } from "./pages/Dashboard";
import { AgentList } from "./pages/agents/AgentList";
import { AgentShow } from "./pages/agents/AgentShow";
import { AgentCreate } from "./pages/agents/AgentCreate";
import { RunList } from "./pages/runs/RunList";
import { RunShow } from "./pages/runs/RunShow";
import { CodeReviewList } from "./pages/reviews/CodeReviewList";
import { CodeReviewShow } from "./pages/reviews/CodeReviewShow";
import { ApprovalList } from "./pages/approvals/ApprovalList";
import { ApprovalShow } from "./pages/approvals/ApprovalShow";
import { PipelineList } from "./pages/pipelines/PipelineList";
import { PipelineShow } from "./pages/pipelines/PipelineShow";

import "@refinedev/antd/dist/reset.css";
import "./index.css";

const App: React.FC = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ConfigProvider theme={theme}>
        <AntdApp>
          <Refine
            routerProvider={routerProvider}
            dataProvider={dataProvider}
            authProvider={authProvider}
            notificationProvider={useNotificationProvider}
            resources={[
              {
                name: "dashboard",
                list: "/",
                meta: { label: "Dashboard", icon: <DashboardOutlined /> },
              },
              {
                name: "agents",
                list: "/agents",
                show: "/agents/:id",
                create: "/agents/create",
                meta: { label: "Agents", icon: <RobotOutlined /> },
              },
              {
                name: "runs",
                list: "/runs",
                show: "/runs/:id",
                meta: { label: "Runs", icon: <PlayCircleOutlined /> },
              },
              {
                name: "reviews",
                list: "/reviews",
                show: "/reviews/:id",
                meta: { label: "Code Reviews", icon: <CodeOutlined /> },
              },
              {
                name: "approvals",
                list: "/approvals",
                show: "/approvals/:id",
                meta: { label: "Approvals", icon: <CheckCircleOutlined /> },
              },
              {
                name: "pipelines",
                list: "/pipelines",
                show: "/pipelines/:id",
                meta: { label: "Pipelines", icon: <DeploymentUnitOutlined /> },
              },
            ]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
              projectId: "erp-autonomous-coding",
            }}
          >
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
              </Route>
            </Routes>
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
