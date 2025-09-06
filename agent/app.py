from fastapi import FastAPI, Request
import os, requests

MIDDLEWARE_URL = os.getenv("MIDDLEWARE_URL", "http://middleware:8001/query")

app = FastAPI()

@app.post("/query")
async def forward_query(request: Request):
    payload = await request.json()
    token = request.headers.get("Authorization")
    headers = {"Authorization": token} if token else {}
    resp = requests.post(MIDDLEWARE_URL, json=payload, headers=headers)
    return resp.json()
