# MarketMind AI -- Marketing Intelligence Platform

A full-stack marketing intelligence platform that combines generative AI content creation with autonomous campaign planning. Built on Groq LLaMA 3.3, CrewAI, LangChain, and React.

---

## Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [CI/CD Pipeline](#cicd-pipeline)
- [Tech Stack](#tech-stack)
- [License](#license)

---

## Architecture

```
+-----------------------------------------------------+
|            React Frontend (Vite + Router)            |
|   Home | Content Studio | Campaign Planner | History |
+--------------------------+---------------------------+
                           |  REST API
+--------------------------+---------------------------+
|                   FastAPI Backend                    |
|                                                      |
|  +------------------+    +-----------------------+   |
|  |   GenAI Layer    |    |   Agentic AI Layer    |   |
|  |                  |    |                       |   |
|  |  Groq LLaMA 3.3  |    |  CrewAI Planner       |   |
|  |  Prompt Engine   |    |  LangChain Tools      |   |
|  |  Pollinations.ai |    |  6 Marketing Tools    |   |
|  |  ChromaDB        |    |  Goal Decomposition   |   |
|  +------------------+    +-----------------------+   |
|                                                      |
+-----------------------------------------------------+
                           |  Docker Compose
+--------------------------+---------------------------+
|                    DevOps Layer                       |
|   Multi-stage Docker | Compose | GitHub Actions      |
+------------------------------------------------------+
```

---

## Features

### Content Studio (Generative AI)

- **5 content types** -- ad copy, taglines, blog posts, social media posts, and email campaigns.
- **8 tone presets** -- energetic, professional, playful, luxury, urgent, inspirational, friendly, and authoritative.
- **AI image generation** -- powered by Pollinations.ai (free, no API key required).
- **Brand voice memory** -- ChromaDB stores past content as vector embeddings to maintain consistent output across generations.
- **LLM backbone** -- Groq-hosted LLaMA 3.3 70B Versatile for fast inference on the free tier.

### Campaign Planner (Agentic AI)

- **Autonomous planning agent** built with CrewAI and LangChain tool-calling.
- **6 simulated marketing tools** -- budget checker, channel availability, task scheduler, competitor analyzer, audience insights, and ROI estimator.
- Multi-step reasoning loop that decomposes high-level goals into actionable plans with timelines, channel allocation, and budget breakdowns.
- Full transparency into the agent's decision process -- every tool call and intermediate result is surfaced in the UI.

### Chat History

- Persistent session storage backed by ChromaDB.
- Semantic search across past content generations and campaign plans.
- Filter by session type (content or campaign).
- Delete individual sessions.

### DevOps

- Multi-stage Dockerfiles (builder then runtime) for both frontend and backend, minimizing image size.
- Docker Compose orchestration with health checks and automatic restarts.
- GitHub Actions CI/CD pipeline: lint, test, build, and push to Docker Hub.
- Nginx reverse proxy with API proxying and SPA fallback routing.

---

## Quick Start

### Prerequisites

- Docker and Docker Compose
- A Groq API key (free at https://console.groq.com)

### 1. Clone and Configure

```bash
git clone <your-repo-url>
cd marketing-ai-platform
cp .env.example .env
```

Open `.env` and set your `GROQ_API_KEY`.

### 2. Run with Docker Compose

```bash
docker-compose up --build
```

The application will be available at http://localhost:3000.

### 3. Local Development (without Docker)

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

The dev server runs at http://localhost:3000 with hot reloading.

---

## Environment Variables

| Variable       | Required | Description                              |
| -------------- | -------- | ---------------------------------------- |
| `GROQ_API_KEY` | Yes      | API key from https://console.groq.com    |
| `ENVIRONMENT`  | No       | `development` or `production` (defaults to `development`) |

Copy `.env.example` to `.env` and fill in your values before running.

---

## Project Structure

```
marketing-ai-platform/
|
|-- frontend/                        React + Vite
|   |-- src/
|   |   |-- pages/
|   |   |   |-- Home.jsx                Landing page
|   |   |   |-- ContentStudio.jsx       GenAI content generation
|   |   |   |-- CampaignPlanner.jsx     Agentic campaign planning
|   |   |   |-- ChatHistory.jsx         Session history and search
|   |   |   |-- Dashboard.jsx           Platform overview
|   |   |-- components/
|   |   |   |-- Navbar.jsx              Navigation bar
|   |   |-- utils/
|   |   |   |-- api.js                  Axios API client
|   |   |-- App.jsx                     Router and layout
|   |   |-- index.css                   Global styles
|   |-- Dockerfile                      Multi-stage: Node build -> Nginx
|   |-- nginx.conf                      Reverse proxy config
|   |-- package.json
|
|-- backend/                            Python FastAPI
|   |-- app/
|   |   |-- main.py                     Application entry point
|   |   |-- routes/
|   |   |   |-- genai.py                Content generation endpoints
|   |   |   |-- agentic.py              Campaign planner endpoints
|   |   |   |-- history.py              Session history endpoints
|   |   |-- genai/
|   |   |   |-- content_gen.py          Groq prompt engineering
|   |   |   |-- image_gen.py            Pollinations.ai integration
|   |   |-- agents/
|   |   |   |-- planner_agent.py        CrewAI + LangChain agent
|   |   |   |-- tools.py               6 simulated marketing tools
|   |   |-- vectordb/
|   |       |-- chroma_client.py        ChromaDB brand voice store
|   |       |-- history_store.py        ChromaDB session history store
|   |-- Dockerfile                      Multi-stage: pip install -> runtime
|   |-- requirements.txt
|
|-- docker-compose.yml                  Service orchestration
|-- .github/workflows/ci-cd.yml        CI/CD pipeline
|-- .env.example                        Environment variable template
|-- README.md
```

---

## API Reference

### Content Generation

| Method | Endpoint                 | Description                          |
| ------ | ------------------------ | ------------------------------------ |
| POST   | `/api/genai/generate`    | Generate marketing content and images |
| GET    | `/api/genai/content-types` | List available content types        |
| GET    | `/api/genai/tones`       | List available tone options          |

**POST /api/genai/generate** -- Request body:

```json
{
  "topic": "Summer sale for athletic shoes",
  "content_type": "ad_copy",
  "tone": "energetic",
  "include_image": true,
  "image_style": "modern marketing photography"
}
```

### Campaign Planning

| Method | Endpoint                      | Description              |
| ------ | ----------------------------- | ------------------------ |
| POST   | `/api/agentic/plan`           | Run the planner agent    |
| GET    | `/api/agentic/goals/examples` | Get example goal prompts |

**POST /api/agentic/plan** -- Request body:

```json
{
  "goal": "Launch a product campaign targeting Gen Z on social media",
  "generated_content": "<content from Content Studio>",
  "content_type": "ad_copy",
  "topic": "Athletic shoes"
}
```

### Session History

| Method | Endpoint                            | Description                       |
| ------ | ----------------------------------- | --------------------------------- |
| GET    | `/api/history/sessions`             | List all sessions (filterable)    |
| GET    | `/api/history/search?q=<query>`     | Semantic search across sessions   |
| GET    | `/api/history/sessions/{session_id}` | Retrieve a single session        |
| DELETE | `/api/history/sessions/{session_id}` | Delete a session                 |

### Health

| Method | Endpoint  | Description       |
| ------ | --------- | ----------------- |
| GET    | `/health` | Health check      |
| GET    | `/`       | API status        |

---

## CI/CD Pipeline

The project includes a GitHub Actions workflow (`.github/workflows/ci-cd.yml`) that runs on every push to `main`.

**Pipeline stages:**

1. **Test** -- run backend tests with pytest.
2. **Lint** -- run ESLint and validate the Vite production build.
3. **Build** -- build multi-stage Docker images for frontend and backend.
4. **Push** -- push images to Docker Hub.

**Required GitHub secrets:**

| Secret            | Value                          |
| ----------------- | ------------------------------ |
| `GROQ_API_KEY`    | Your Groq API key              |
| `DOCKER_USERNAME` | Your Docker Hub username       |
| `DOCKER_PASSWORD` | Your Docker Hub password/token |

---

## Tech Stack

| Layer       | Technology                                 |
| ----------- | ------------------------------------------ |
| Frontend    | React 18, Vite, React Router, Axios, Lucide |
| LLM         | Groq API (LLaMA 3.3 70B Versatile)        |
| Image Gen   | Pollinations.ai (free, no key required)    |
| Vector DB   | ChromaDB (local, persistent)               |
| Agentic AI  | CrewAI, LangChain, LangChain-Groq         |
| Backend     | FastAPI, Uvicorn, Pydantic                 |
| DevOps      | Docker, Docker Compose, GitHub Actions, Nginx |

---

## License

This project is provided as-is for educational and demonstration purposes.
