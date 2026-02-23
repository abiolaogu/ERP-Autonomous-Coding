export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  details?: Record<string, string[]>;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface SortOrder {
  field: string;
  order: "asc" | "desc";
}

export interface FilterValue {
  field: string;
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "contains" | "in";
  value: unknown;
}

export interface KPIData {
  title: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: string;
}
