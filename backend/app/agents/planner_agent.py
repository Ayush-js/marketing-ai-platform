import os
from langchain_groq import ChatGroq
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from app.agents.tools import ALL_TOOLS

def get_llm():
    return ChatGroq(
        api_key=os.environ.get("GROQ_API_KEY"),
        model="llama-3.3-70b-versatile",
        temperature=0.3,
    )

PLANNER_SYSTEM_PROMPT = """You are an expert Marketing Planning Agent. Your job is to create comprehensive, actionable marketing campaign plans.

When given a marketing goal and generated content, you will:
1. Analyze the goal and content to understand the campaign needs
2. Check available budgets using the budget tool
3. Check channel availability and metrics
4. Analyze relevant competitors
5. Get audience insights
6. Schedule all campaign tasks with realistic timelines
7. Estimate ROI for the proposed plan
8. Produce a detailed, structured execution plan

Always be thorough. Use ALL relevant tools before producing the final plan.
Format your final plan clearly with sections: Overview, Budget Allocation, Channel Strategy, Timeline, Tasks, and Expected ROI.
"""

def run_planner_agent(goal: str, generated_content: str, content_type: str) -> dict:
    """Run the marketing planner agent and return a structured plan."""
    llm = get_llm()

    prompt = ChatPromptTemplate.from_messages([
        ("system", PLANNER_SYSTEM_PROMPT),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])

    agent = create_tool_calling_agent(llm, ALL_TOOLS, prompt)
    executor = AgentExecutor(
        agent=agent,
        tools=ALL_TOOLS,
        verbose=True,
        max_iterations=12,
        handle_parsing_errors=True,
        return_intermediate_steps=True,
    )

    user_input = f"""
Marketing Goal: {goal}

Generated Content Type: {content_type}

Generated Content Preview:
{generated_content[:500]}...

Please create a comprehensive marketing campaign plan for this content.
Check budgets for relevant channels, analyze the top competitor in this space,
get audience insights, schedule all tasks, and estimate the ROI.
Produce a detailed execution plan.
"""

    result = executor.invoke({"input": user_input})

    # Extract tool usage steps for transparency
    steps = []
    for action, observation in result.get("intermediate_steps", []):
        steps.append({
            "tool": action.tool,
            "input": str(action.tool_input)[:200],
            "output": str(observation)[:300]
        })

    return {
        "plan": result["output"],
        "steps": steps,
        "goal": goal,
        "content_type": content_type
    }
