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

@app.get("/health")
async def health_check():
    """Health check endpoint for deployment monitoring"""
    return {"status": "healthy", "service": "agent"}

@app.post("/query")
async def forward_query(request: Request):
    from fastapi import HTTPException
    
    payload = await request.json()
    token = request.headers.get("Authorization")
    headers = {"Authorization": token} if token else {}
    
    resp = requests.post(MIDDLEWARE_URL, json=payload, headers=headers)
    
    # Check if the middleware returned an error status
    if resp.status_code != 200:
        # Forward the error status and message from middleware
        try:
            error_detail = resp.json().get("detail", "Access denied")
        except:
            error_detail = "Access denied"
        raise HTTPException(status_code=resp.status_code, detail=error_detail)
    
    return resp.json()
