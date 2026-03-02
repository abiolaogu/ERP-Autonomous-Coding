export const APP_NAME = "ERP Autonomous Coding";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
export const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || "http://localhost:8090/v1/graphql";

export const TOKEN_KEY = "erp-coding-access-token";
export const REFRESH_TOKEN_KEY = "erp-coding-refresh-token";
export const USER_KEY = "erp-coding-user";

export const DATE_FORMAT = "YYYY-MM-DD";
export const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
export const TIME_FORMAT = "HH:mm";
export const DISPLAY_DATE_FORMAT = "MMM D, YYYY";
export const DISPLAY_DATE_TIME_FORMAT = "MMM D, YYYY h:mm A";

export const PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const AGENT_STATUS_COLORS: Record<string, string> = {
  idle: "default",
  running: "processing",
  paused: "warning",
  error: "error",
};

export const RUN_STATUS_COLORS: Record<string, string> = {
  queued: "default",
  running: "processing",
  review: "warning",
  completed: "success",
  failed: "error",
  cancelled: "default",
};

export const REVIEW_STATUS_COLORS: Record<string, string> = {
  pending: "warning",
  approved: "success",
  changes_requested: "orange",
  rejected: "error",
};

export const APPROVAL_STATUS_COLORS: Record<string, string> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

export const PIPELINE_STATUS_COLORS: Record<string, string> = {
  active: "success",
  paused: "warning",
  disabled: "default",
};

export const STAGE_STATUS_COLORS: Record<string, string> = {
  pending: "default",
  running: "processing",
  passed: "success",
  failed: "error",
  skipped: "default",
};

export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3776ab",
  Go: "#00add8",
  Rust: "#dea584",
  Java: "#b07219",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4f5d95",
  Swift: "#f05138",
};

export const MODEL_OPTIONS = [
  { label: "Claude Opus 4", value: "claude-opus-4" },
  { label: "Claude Sonnet 4", value: "claude-sonnet-4" },
  { label: "GPT-4o", value: "gpt-4o" },
  { label: "GPT-4 Turbo", value: "gpt-4-turbo" },
  { label: "Gemini Pro", value: "gemini-pro" },
];

export const LANGUAGE_OPTIONS = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Go",
  "Rust",
  "Java",
  "C#",
  "Ruby",
  "PHP",
  "Swift",
].map((l) => ({ label: l, value: l }));
