# ERP-Autonomous-Coding Architecture

## C4 Context
- Module: `ERP-Autonomous-Coding`
- Mode: standalone_plus_suite
- Auth: ERP-IAM (OIDC/JWT)
- Entitlements: ERP-Platform

## Container View
```mermaid
flowchart TB
    U["Users"] --> G["Gateway / API"]
    S1["agent-core"]
    S2["git-bridge"]
    S3["ide-server"]
    S4["review-engine"]
    S5["sandbox-runtime"]
    S6["task-planner"]
    G --> S1
    G --> S2
    G --> S3
    G --> S4
    G --> S5
    G --> S6
    G --> DB["PostgreSQL"]
    G --> EV["Redpanda/Kafka"]
```

## Service Inventory
- `agent-core`
- `git-bridge`
- `ide-server`
- `review-engine`
- `sandbox-runtime`
- `task-planner`
