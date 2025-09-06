from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os, requests

MIDDLEWARE_URL = os.getenv("MIDDLEWARE_URL", "http://middleware:8001/query")

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.post("/query")
async def forward_query(request: Request):
    payload = await request.json()
    token = request.headers.get("Authorization")
    headers = {"Authorization": token} if token else {}
    resp = requests.post(MIDDLEWARE_URL, json=payload, headers=headers)
    return resp.json()
