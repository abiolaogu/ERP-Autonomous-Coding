import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";
import { DISPLAY_DATE_FORMAT, DISPLAY_DATE_TIME_FORMAT } from "./constants";

dayjs.extend(relativeTime);
dayjs.extend(duration);

export function formatDate(date: string | undefined | null): string {
  if (!date) return "-";
  return dayjs(date).format(DISPLAY_DATE_FORMAT);
}

export function formatDateTime(date: string | undefined | null): string {
  if (!date) return "-";
  return dayjs(date).format(DISPLAY_DATE_TIME_FORMAT);
}

export function formatRelativeTime(date: string | undefined | null): string {
  if (!date) return "-";
  return dayjs(date).fromNow();
}

export function formatDuration(seconds: number | undefined | null): string {
  if (seconds === undefined || seconds === null) return "-";
  const d = dayjs.duration(seconds, "seconds");
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${d.minutes()}m ${d.seconds()}s`;
  return `${d.hours()}h ${d.minutes()}m`;
}

export function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null) return "-";
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatCompactNumber(value: number | undefined | null): string {
  if (value === undefined || value === null) return "-";
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatCurrency(value: number | undefined | null, currency = "USD"): string {
  if (value === undefined || value === null) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
}

export function formatPercentage(value: number | undefined | null, decimals = 1): string {
  if (value === undefined || value === null) return "-";
  return `${value.toFixed(decimals)}%`;
}

export function formatTokens(tokens: number): string {
  if (tokens < 1000) return `${tokens}`;
  if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}K`;
  return `${(tokens / 1000000).toFixed(2)}M`;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + "...";
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function statusLabel(status: string): string {
  return status
    .split("_")
    .map((word) => capitalize(word))
    .join(" ");
}
