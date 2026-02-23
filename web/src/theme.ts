import type { ThemeConfig } from "antd";

export const theme: ThemeConfig = {
  token: {
    colorPrimary: "#0f6fa8",
    borderRadius: 10,
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    colorBgContainer: "#ffffff",
    colorBgLayout: "#f5f7fa",
    colorText: "#1a2030",
    colorTextSecondary: "#6b7a8d",
    colorBorder: "#e2e8f0",
    colorSuccess: "#10b981",
    colorWarning: "#f59e0b",
    colorError: "#ef4444",
    colorInfo: "#0f6fa8",
  },
  components: {
    Layout: {
      siderBg: "#0a1628",
      headerBg: "#ffffff",
      bodyBg: "#f5f7fa",
    },
    Menu: {
      darkItemBg: "#0a1628",
      darkSubMenuItemBg: "#0d1f3c",
      darkItemSelectedBg: "#0f6fa8",
      darkItemColor: "#a0aec0",
      darkItemSelectedColor: "#ffffff",
      darkItemHoverColor: "#ffffff",
      darkItemHoverBg: "#162a4a",
    },
    Card: {
      borderRadiusLG: 10,
    },
    Table: {
      borderRadius: 10,
      headerBg: "#f8fafc",
    },
    Button: {
      borderRadius: 8,
    },
    Input: {
      borderRadius: 8,
    },
    Select: {
      borderRadius: 8,
    },
  },
};
