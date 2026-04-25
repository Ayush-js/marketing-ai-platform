from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import genai, agentic

app = FastAPI(
    title="Marketing AI Platform API",
    description="GenAI content generation + Agentic marketing planning",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(genai.router, prefix="/api/genai", tags=["GenAI"])
app.include_router(agentic.router, prefix="/api/agentic", tags=["Agentic"])

@app.get("/")
def root():
    return {"status": "Marketing AI Platform running", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}
