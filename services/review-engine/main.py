from fastapi import FastAPI

app = FastAPI(title="Autonomous Coding Review Engine")

@app.get('/healthz')
def healthz():
    return {"status": "healthy", "service": "review-engine"}
