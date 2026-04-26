from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.agents.planner_agent import run_planner_agent

router = APIRouter()

class PlanRequest(BaseModel):
    goal: str
    generated_content: str
    content_type: str = "ad_copy"
    topic: str = ""

class ToolStep(BaseModel):
    tool: str
    input: str
    output: str

class PlanResponse(BaseModel):
    plan: str
    steps: List[ToolStep]
    goal: str
    content_type: str

@router.post("/plan", response_model=PlanResponse)
async def create_campaign_plan(req: PlanRequest):
    try:
        result = run_planner_agent(
            goal=req.goal,
            generated_content=req.generated_content,
            content_type=req.content_type
        )

        # Save to history — non-fatal
        try:
            from app.vectordb.history_store import save_campaign_session
            save_campaign_session(
                goal=result["goal"],
                content_type=result["content_type"],
                plan=result["plan"],
                steps=[{"tool": s["tool"], "input": s["input"], "output": s["output"]} for s in result["steps"]],
            )
        except Exception as hist_err:
            print(f"[History] Campaign save failed (non-fatal): {hist_err}")

        return PlanResponse(
            plan=result["plan"],
            steps=[ToolStep(**s) for s in result["steps"]],
            goal=result["goal"],
            content_type=result["content_type"]
        )
    except Exception as e:
        print(f"[Agentic] Fatal error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/goals/examples")
def get_example_goals():
    return {
        "examples": [
            "Launch a new product campaign targeting Gen Z on social media",
            "Analyze competitor ads and create a counter-campaign strategy",
            "Build a 30-day email nurture sequence for new leads",
            "Create a viral social media campaign with influencer partnerships",
            "Plan a seasonal sale campaign across all digital channels",
        ]
    }