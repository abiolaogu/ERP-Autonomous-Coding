from fastapi import FastAPI

app = FastAPI(title="OpenHands Review Engine")

@app.get('/healthz')
def healthz():
    return {"status": "healthy", "service": "review-engine"}
