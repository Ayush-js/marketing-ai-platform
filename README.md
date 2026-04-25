# MarketMind AI — Marketing Intelligence Platform

> **GenAI content generation + Agentic campaign planning + Docker DevOps**  
> Built with Groq LLaMA 3.3 + Pollinations.ai + CrewAI + LangChain + React

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│            React Frontend (Vite + Router)            │
│   Home │ Content Studio │ Campaign Planner │ Dashboard│
└───────────────────┬─────────────────────────────────┘
                    │ FastAPI (REST)
┌───────────────────┴─────────────────────────────────┐
│                  Python Backend                      │
│                                                      │
│  ┌─────────────────┐    ┌──────────────────────┐    │
│  │   GenAI Layer   │    │   Agentic AI Layer   │    │
│  │                 │    │                      │    │
│  │ • Groq LLaMA3.3 │    │ • CrewAI Planner     │    │
│  │ • Prompt Engine │    │ • LangChain Tools    │    │
│  │ • Pollinations  │    │ • 6 Mock Tools       │    │
│  │ • ChromaDB      │    │ • Goal Decomposition │    │
│  └─────────────────┘    └──────────────────────┘    │
└─────────────────────────────────────────────────────┘
                    │ Docker Compose
┌───────────────────┴─────────────────────────────────┐
│              DevOps Layer                            │
│  Docker (multi-stage) │ Compose │ GitHub Actions     │
└─────────────────────────────────────────────────────┘
```

## Features

### GenAI — Content Studio
- **5 content types**: Ad Copy, Taglines, Blog Posts, Social Posts, Email Campaigns
- **8 tones**: Energetic, Professional, Playful, Luxury, Urgent, Inspirational, Friendly, Authoritative
- **AI Images**: Free via Pollinations.ai (no API key needed)
- **Vector DB**: ChromaDB stores brand voice context for consistent output
- **LLM**: Groq LLaMA 3.3 70B Versatile (fast, free tier)

### Agentic AI — Campaign Planner
- **CrewAI + LangChain** planner agent with tool calling
- **6 mock tools**: budget checker, channel availability, task scheduler, competitor analyzer, audience insights, ROI estimator
- Autonomous multi-step reasoning loop
- Full execution plan with timeline, channels, and budget allocation
- Transparent tool usage display (see every step the agent took)

### DevOps
- **Multi-stage Dockerfiles** (builder → runtime) for frontend and backend
- **Docker Compose** orchestrates all services with health checks
- **GitHub Actions** CI/CD: lint → test → build → push to Docker Hub
- Nginx reverse proxy with API proxying and SPA routing

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Groq API key (free at https://console.groq.com)

### 1. Clone & Configure
```bash
git clone <your-repo-url>
cd marketing-ai-platform
cp .env.example .env
# Edit .env and set your GROQ_API_KEY
```

### 2. Run with Docker Compose
```bash
docker-compose up --build
```

Open http://localhost:3000

### 3. Local Development (without Docker)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env  # set GROQ_API_KEY
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev  # runs at http://localhost:3000
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | Get free at https://console.groq.com |

---

## CI/CD Setup (GitHub Actions)

Add these secrets to your GitHub repo (Settings → Secrets):

| Secret | Value |
|---|---|
| `GROQ_API_KEY` | Your Groq API key |
| `DOCKER_USERNAME` | Your Docker Hub username |
| `DOCKER_PASSWORD` | Your Docker Hub password/token |

The pipeline runs on every push to `main`:
1. **Test** backend (pytest)
2. **Lint** frontend (ESLint + Vite build)
3. **Build** multi-stage Docker images
4. **Push** to Docker Hub

---

## Project Structure

```
marketing-ai-platform/
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── ContentStudio.jsx    # GenAI page
│   │   │   ├── CampaignPlanner.jsx  # Agentic AI page
│   │   │   └── Dashboard.jsx
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   └── utils/api.js
│   ├── Dockerfile              # Multi-stage: Node build → Nginx
│   └── nginx.conf
│
├── backend/                    # Python FastAPI
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   │   ├── genai.py            # /api/genai/generate
│   │   │   └── agentic.py          # /api/agentic/plan
│   │   ├── genai/
│   │   │   ├── content_gen.py      # Groq prompt engineering
│   │   │   └── image_gen.py        # Pollinations.ai
│   │   ├── agents/
│   │   │   ├── planner_agent.py    # CrewAI + LangChain
│   │   │   └── tools.py            # 6 mock marketing tools
│   │   └── vectordb/
│   │       └── chroma_client.py    # ChromaDB brand voice
│   └── Dockerfile              # Multi-stage: pip install → runtime
│
├── docker-compose.yml
├── .github/workflows/ci-cd.yml
├── .env.example
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/genai/generate` | Generate marketing content |
| GET | `/api/genai/content-types` | List content types |
| GET | `/api/genai/tones` | List tone options |
| POST | `/api/agentic/plan` | Run planner agent |
| GET | `/api/agentic/goals/examples` | Example goals |
| GET | `/health` | Health check |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Axios |
| LLM | Groq API (LLaMA 3.3 70B Versatile) |
| Image Gen | Pollinations.ai (free, no key) |
| Vector DB | ChromaDB (local) |
| Agentic AI | LangChain + CrewAI |
| Backend | FastAPI + Uvicorn |
| DevOps | Docker, Docker Compose, GitHub Actions |
