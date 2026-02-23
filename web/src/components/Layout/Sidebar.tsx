import React from "react";
import { Layout, Menu, Typography } from "antd";
import {
  DashboardOutlined,
  RobotOutlined,
  PlayCircleOutlined,
  CodeOutlined,
  CheckCircleOutlined,
  DeploymentUnitOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const { Sider } = Layout;
const { Text } = Typography;

interface SidebarProps {
  collapsed: boolean;
}

const menuItems = [
  {
    key: "/",
    icon: <DashboardOutlined />,
    label: "Dashboard",
  },
  {
    key: "/agents",
    icon: <RobotOutlined />,
    label: "Agents",
  },
  {
    key: "/runs",
    icon: <PlayCircleOutlined />,
    label: "Runs",
  },
  {
    key: "/reviews",
    icon: <CodeOutlined />,
    label: "Code Reviews",
  },
  {
    key: "/approvals",
    icon: <CheckCircleOutlined />,
    label: "Approvals",
  },
  {
    key: "/pipelines",
    icon: <DeploymentUnitOutlined />,
    label: "Pipelines",
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = menuItems
    .filter((item) => item.key !== "/")
    .find((item) => location.pathname.startsWith(item.key))?.key || "/";

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={260}
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
      }}
      theme="dark"
    >
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? "0" : "0 24px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <RobotOutlined style={{ fontSize: 24, color: "#0f6fa8" }} />
        {!collapsed && (
          <Text
            strong
            style={{
              color: "#fff",
              fontSize: 16,
              marginLeft: 12,
              whiteSpace: "nowrap",
            }}
          >
            AutoCode ERP
          </Text>
        )}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{ borderRight: 0, marginTop: 8 }}
      />
    </Sider>
  );
};
