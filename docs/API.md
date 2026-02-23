# ERP-Autonomous-Coding API

## Core Endpoints
- `GET /healthz`
- `GET /v1/capabilities`

## Discovered Endpoints
- `/healthz`
- `/v1/capabilities`
- `/v1/task-planner`
- `/v1/tasks/run`

## Permissions
- JWT from ERP-IAM required for business endpoints
- `X-Tenant-ID` required for tenant-scoped data
