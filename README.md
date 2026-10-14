# Nexus AI

> A unified collaborative workspace connecting project documentation, task tracking, visual workflow diagrams, and GitHub repository activity with a context-aware AI assistant.

[![Live Demo](https://img.shields.io/badge/Demo-Live%20Preview-brightgreen)](https://nexus-avadhesh.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20Supabase-4169E1)](https://supabase.com/)

---

## Overview

Software engineering teams often distribute their daily work across disparate tools: one platform for task tracking, another for documentation, a separate app for architecture diagrams, and GitHub for source code. Standard conversational AI tools operate outside this workflow, lacking visibility into the team's active tasks, specifications, and code reviews.

**Nexus AI** integrates these essentials into a single workspace. It brings together rich document authoring, Kanban task management, team chat, node-based workflow diagrams, and GitHub activity feeds. An integrated AI assistant uses workspace context to answer questions from internal documentation, look up tasks, inspect team conversations, and help team members coordinate their work.

---

## Key Features

- **Context-Aware AI Assistant**: A conversational assistant built with LangGraph and Google Gemini that interacts directly with workspace data. It answers questions from uploaded documentation, checks active tasks, reviews chat context, and creates or updates tasks with workspace role awareness.
- **Document Knowledge Base & Semantic Search**: Rich-text document editing with TipTap alongside multi-format file uploads (PDF, DOCX, CSV, Excel, TXT, and Markdown). Documents are parsed, split into text chunks, and indexed using PostgreSQL vector embeddings (`pgvector`) for similarity search.
- **Visual Workflow Canvas (Nexus Flow)**: An interactive node-based flowchart and architecture designer powered by React Flow (`@xyflow/react`). Teams can model release pipelines, incident triage steps, or service topologies, link canvas nodes directly to workspace tasks and documents, capture point-in-time snapshots, and generate automated AI explanations of workflows.
- **Task Management**: An interactive Kanban board organizing work into Todo, In Progress, and Done. Supports priority levels, multi-assignee allocation, due dates, and automated email notifications.
- **Team Communication**: Public workspace channels and direct messaging with live updates powered by Supabase Realtime WebSockets.
- **GitHub Intelligence**: Connects to GitHub repositories via a GitHub App to ingest commits and pull requests. Automatically suggests links between pull requests and open tasks based on branch and title signals, and generates summaries of recent repository activity.
- **Workspace Governance & Role Management**: Multi-tenant workspace separation with role-based access control (`owner`, `admin`, `member`, `viewer`), time-limited invite links, and configurable workspace settings.

---

## What Makes Nexus AI Different

- **Grounded AI Assistance**: Rather than acting as a detached conversational bot, the assistant is wired into workspace context (documentation, task boards, and discussions) to provide actionable answers and project updates.
- **Integrated Architecture Diagrams**: Diagramming is often siloed from daily execution. Nexus Flow links visual nodes directly to relevant tasks and documentation, keeping process diagrams aligned with actual work.
- **Unified Engineering Hub**: By linking GitHub pull requests and commits directly with Kanban tasks and team chat, developers and project leads can follow code progress without switching between multiple browser tabs.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | [Next.js 14](https://nextjs.org/) (App Router), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [@xyflow/react](https://reactflow.dev/), [TipTap](https://tiptap.dev/), [Zustand](https://zustand.docs.pmnd.rs/), [TanStack Query](https://tanstack.com/query), [Axios](https://axios-http.com/) |
| **Backend** | [FastAPI](https://fastapi.tiangolo.com/), [Python](https://www.python.org/) 3.11+, [Uvicorn](https://www.uvicorn.org/), [SQLAlchemy 2.0](https://www.sqlalchemy.org/), [SlowAPI](https://github.com/laurentS/slowapi), Argon2 password hashing |
| **Database & Cache** | [PostgreSQL 16](https://www.postgresql.org/) (via [Supabase](https://supabase.com/)), [pgvector](https://github.com/pgvector/pgvector), [Redis](https://redis.io/) |
| **AI & Integrations** | [Google Gemini 2.5 Flash](https://ai.google.dev/), [Gemini Embeddings](https://ai.google.dev/), [LangGraph](https://langchain-ai.github.io/langgraph/), [GitHub App API](https://docs.github.com/en/apps) & Webhooks |

---

## Live Demo

- **Web Application**: [https://nexus-avadhesh.vercel.app](https://nexus-avadhesh.vercel.app)
- **API Documentation**: Interactive OpenAPI / Swagger UI is available locally at `http://localhost:8000/docs` when running the backend service.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [Python](https://www.python.org/) (3.11 or 3.12)
- [Docker](https://www.docker.com/) & Docker Compose (optional, for containerized services)
- **External Services**:
  - [Supabase](https://supabase.com/): Provides PostgreSQL with the `vector` extension for document search, table publications for real-time messaging, and API keys (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
  - [Google AI Studio](https://aistudio.google.com/): API key (`GEMINI_API_KEY`) for Gemini 2.5 Flash agent reasoning and Gemini vector embeddings (`gemini-embedding-2-preview`).
  - *Optional*: GitHub App credentials (for repository sync and webhook ingestion) and an SMTP account (for email alerts). The application operates normally without these if those integrations are not required.

### Database & Service Architecture

Nexus AI uses a hybrid service topology:
- **Relational Tables**: SQLAlchemy manages users, workspaces, memberships, tasks, documents, and flows. In Docker Compose, the backend connects by default to the local PostgreSQL container (`nexus-postgres-local`). For manual execution without a local PostgreSQL container, `DATABASE_URL` can point directly to your cloud Supabase PostgreSQL instance.
- **Vector Search & Realtime Chat**: The backend RAG pipeline and chat routes communicate directly with Supabase client APIs (`embeddings` and `messages` tables). Therefore, `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are required even when using local PostgreSQL for relational data.
- **Caching**: Redis is used for high-frequency workspace activity caching and development fingerprinting.

---

### 1. Clone the Repository

```bash
git clone https://github.com/avadhesh11/Nexus.git
cd Nexus
```

### 2. Configure Environment Variables

Create the local environment files based on the examples below. Note that all URLs must be plain text without Markdown formatting.

**Backend (`backend/.env`):**
```env
DATABASE_URL=postgresql://user:password@host:5432/postgres
JWT_SECRET=your-random-jwt-secret-string
PRODUCTION=false
FRONTEND_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379/0

# Supabase (Required for vector store & chat)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-key

# Google Gemini (Required for AI assistant & embeddings)
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash

# Optional: GitHub App Integration
GITHUB_APP_ID=
GITHUB_APP_SLUG=
GITHUB_WEBHOOK_SECRET=
GITHUB_APP_PRIVATE_KEY_PATH=

# Optional: SMTP Email Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run with Docker Compose

Docker Compose builds and starts four services:
1. `postgres`: Local PostgreSQL 16 on port `5432`
2. `redis`: Redis 7 on port `6379`
3. `backend`: FastAPI API on port `8000` (overrides `DATABASE_URL` to the local container)
4. `frontend`: Next.js 14 web client on port `3000`

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API Docs: `http://localhost:8000/docs`

### 4. Manual Execution (Without Docker Compose)

If you prefer running services manually:

**Step 1: Start Redis**
```bash
docker run -d -p 6379:6379 --name nexus-redis redis:7-alpine
```

**Step 2: Start Backend**
```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Step 3: Start Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## Future Scope

The following capabilities represent planned enhancements:
- **Collaborative Canvas Editing**: Multi-user real-time cursor editing and graph synchronization for Nexus Flow diagrams using CRDTs.
- **Asynchronous Ingestion Workers**: Offloading large document parsing and vector indexing workloads to a dedicated background worker queue (such as Celery or ARQ).
- **Automated Test Coverage**: Building end-to-end and unit test suites using `pytest` and Playwright for CI/CD pipelines.

---

## License

This project is licensed under the [MIT License](LICENSE).
