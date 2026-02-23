import React from "react";
import { Layout, Button, Avatar, Dropdown, Space, Typography, theme } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const { token } = theme.useToken();

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    { type: "divider" as const },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "logout") {
      logout();
    }
  };

  return (
    <AntHeader
      style={{
        padding: "0 24px",
        background: token.colorBgContainer,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: `1px solid ${token.colorBorder}`,
        position: "sticky",
        top: 0,
        zIndex: 99,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggle}
        style={{ fontSize: 16, width: 48, height: 48 }}
      />

      <Space size={16}>
        <Button
          type="text"
          icon={<BellOutlined />}
          style={{ fontSize: 18 }}
        />
        <Dropdown
          menu={{ items: userMenuItems, onClick: handleMenuClick }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Space style={{ cursor: "pointer" }}>
            <Avatar
              size={36}
              icon={<UserOutlined />}
              src={user?.avatar}
              style={{ backgroundColor: "#0f6fa8" }}
            />
            <Text strong style={{ fontSize: 14 }}>
              {user?.name || "User"}
            </Text>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};
