from fastapi import FastAPI, Request
import json, os

LOG_FILE = "/logs/access.log"
app = FastAPI()

@app.post("/log")
async def write_log(request: Request):
    data = await request.json()
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    with open(LOG_FILE, "a") as f:
        f.write(json.dumps(data) + "\n")
    return {"status": "ok"}
