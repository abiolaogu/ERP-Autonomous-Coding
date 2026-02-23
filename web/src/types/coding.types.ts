export interface CodingAgent {
  id: string;
  name: string;
  description: string;
  language: string;
  repository: string;
  status: "idle" | "running" | "paused" | "error";
  model: string;
  maxTokens: number;
  createdAt: string;
  lastRunAt?: string;
}

export interface CodingRun {
  id: string;
  agentId: string;
  agentName: string;
  repository: string;
  branch: string;
  status: "queued" | "running" | "review" | "completed" | "failed" | "cancelled";
  task: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  tokensUsed: number;
  cost: number;
}

export interface CodeReview {
  id: string;
  runId: string;
  agentName: string;
  filePath: string;
  changeType: "added" | "modified" | "deleted";
  additions: number;
  deletions: number;
  patch: string;
  comments: ReviewComment[];
  status: "pending" | "approved" | "changes_requested" | "rejected";
}

export interface ReviewComment {
  id: string;
  author: string;
  line: number;
  body: string;
  createdAt: string;
}

export interface CodingApproval {
  id: string;
  runId: string;
  agentName: string;
  type: "merge" | "deploy" | "rollback";
  status: "pending" | "approved" | "rejected";
  summary: string;
  filesChanged: number;
  createdAt: string;
  reviewedBy?: string;
}

export interface Pipeline {
  id: string;
  name: string;
  repository: string;
  trigger: "push" | "pr" | "schedule" | "manual";
  status: "active" | "paused" | "disabled";
  stages: PipelineStage[];
  lastRunAt?: string;
  successRate: number;
}

export interface PipelineStage {
  name: string;
  type: "lint" | "test" | "build" | "review" | "deploy";
  status: "pending" | "running" | "passed" | "failed" | "skipped";
  duration?: number;
}

export interface CodingMetrics {
  totalAgents: number;
  activeRuns: number;
  completedToday: number;
  linesChanged: number;
  reviewsPending: number;
  approvalRate: number;
}
