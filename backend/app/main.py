from fastapi import FastAPI,Response
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import auth,workspaces,documents,chat,tasks,ai
# Create tables
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Could not create tables: {e}")

app = FastAPI(title="Nexus AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080","http://localhost:3000","https://nexusai-gray.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(workspaces.router, prefix="/api") 
app.include_router(documents.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(ai.router, prefix="/api")

@app.get("/api/health")
def health(response: Response):
    response.headers["Cache-Control"] = "no-store"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"

    return {
        "status": "ok",
        "services": {
            "api": "operational",
            "database": "operational",
            "agent_engine": "operational"
        }
    }