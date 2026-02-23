from fastapi import FastAPI, Header, HTTPException

app = FastAPI(title="ERP-Autonomous-Coding task-planner")

@app.get('/healthz')
def healthz():
    return {"status": "healthy", "module": "ERP-Autonomous-Coding", "service": "task-planner"}

@app.get('/v1/task-planner')
def list_items(x_tenant_id: str | None = Header(default=None)):
    if not x_tenant_id:
        raise HTTPException(status_code=400, detail='missing X-Tenant-ID')
    return {"items": [], "event_topic": "erp.autonomous_coding.task-planner.listed"}
