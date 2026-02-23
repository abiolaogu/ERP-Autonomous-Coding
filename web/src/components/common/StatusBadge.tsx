import React from "react";
import { Badge, Tag } from "antd";
import { statusLabel } from "@/utils/formatters";

interface StatusBadgeProps {
  status: string;
  colorMap?: Record<string, string>;
  variant?: "tag" | "badge";
}

const DEFAULT_COLORS: Record<string, string> = {
  active: "success",
  completed: "success",
  approved: "success",
  passed: "success",
  idle: "default",
  pending: "warning",
  queued: "default",
  running: "processing",
  paused: "warning",
  review: "warning",
  in_progress: "processing",
  error: "error",
  failed: "error",
  rejected: "error",
  cancelled: "default",
  disabled: "default",
  skipped: "default",
  changes_requested: "orange",
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  colorMap,
  variant = "tag",
}) => {
  const colors = { ...DEFAULT_COLORS, ...colorMap };
  const color = colors[status] || "default";
  const label = statusLabel(status);

  if (variant === "badge") {
    const badgeStatus = (
      {
        success: "success",
        processing: "processing",
        error: "error",
        warning: "warning",
        default: "default",
      } as Record<string, "success" | "processing" | "error" | "warning" | "default">
    )[color] || "default";

    return <Badge status={badgeStatus} text={label} />;
  }

  return (
    <Tag
      color={color}
      style={{ borderRadius: 6, fontWeight: 500, fontSize: 12 }}
    >
      {label}
    </Tag>
  );
};
