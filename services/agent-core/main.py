from fastapi import FastAPI

app = FastAPI(title="Autonomous Coding Agent Core")

@app.get('/healthz')
def healthz():
    return {"status": "healthy", "service": "agent-core"}
