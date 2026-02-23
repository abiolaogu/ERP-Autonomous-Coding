import React from "react";
import { Card, Statistic, Typography } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface KPICardProps {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: string;
  loading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  prefix,
  suffix,
  change,
  changeLabel,
  icon,
  color = "#0f6fa8",
  loading = false,
}) => {
  return (
    <Card
      loading={loading}
      style={{ height: "100%" }}
      styles={{ body: { padding: "20px 24px" } }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <Text type="secondary" style={{ fontSize: 13, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {title}
          </Text>
          <Statistic
            value={value}
            prefix={prefix}
            suffix={suffix}
            valueStyle={{ fontSize: 28, fontWeight: 700, color, marginTop: 4 }}
          />
          {change !== undefined && (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
              {change >= 0 ? (
                <ArrowUpOutlined style={{ color: "#10b981", fontSize: 12 }} />
              ) : (
                <ArrowDownOutlined style={{ color: "#ef4444", fontSize: 12 }} />
              )}
              <Text
                style={{
                  fontSize: 13,
                  color: change >= 0 ? "#10b981" : "#ef4444",
                  fontWeight: 600,
                }}
              >
                {Math.abs(change)}%
              </Text>
              {changeLabel && (
                <Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>
                  {changeLabel}
                </Text>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: `${color}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              color,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
