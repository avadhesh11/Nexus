# Nexus AI — The Unified Agentic Workspace

> **Docs, real-time chat, interactive task boards, GitHub intelligence, and LangGraph agentic AI memory — unified into a single collaborative ecosystem.**

[![Next.js 14](https://img.shields.io/badge/Next.js-14_App_Router-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python)](https://python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Agentic_AI-FF6F00?style=flat-square&logo=langchain)](https://langchain-ai.github.io/langgraph/)
[![Google Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?style=flat-square&logo=google)](https://deepmind.google/technologies/gemini/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_&_Realtime-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![pgvector](https://img.shields.io/badge/pgvector-Vector_Search-336791?style=flat-square&logo=postgresql)](https://github.com/pgvector/pgvector)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker)](https://docker.com/)

---

## 🌟 Overview

**Nexus AI** is an enterprise-grade collaborative workspace that treats AI not as an external chatbot, but as an **active, autonomous team member** with complete contextual awareness over your team's documents, tasks, discussions, and code repositories.

Built on a **ReAct Agentic LangGraph Architecture** and **pgvector RAG**, Nexus AI can autonomously query documentation, manage project task boards, send automated email alerts, summarize GitHub pushes, and correlate pull requests to open tasks.

---

## 🚀 Key Feature Highlights

### 🧠 1. LangGraph Agentic AI Assistant
- **ReAct Execution Engine**: Built with LangGraph `create_react_agent` and Google Gemini 2.5 Flash for multi-step reasoning and autonomous tool invocation.
- **Role-Aware Dynamic Tool Bindings**:
  - **Knowledge Search (`search_workspace`)**: Semantic similarity search over vectorized workspace documents.
  - **Task Management (`get_tasks`, `create_task`, `update_task`)**: Query, create, re-prioritize, and update task statuses.
  - **Chat Context (`get_recent_chat`)**: Read recent workspace discussions for holistic context.
  - **Automated Email Dispatch (`send_task_reminder_email`, `send_deadline_alert_email`, `send_important_info_email`)**: Automated SMTP reminders and broadcast announcements.
- **Multi-Session History**: Persistent conversational threads with automatic semantic titling.
- **Workspace AI Governance**: Admin-configurable daily prompt quotas per member.
- **Observability**: Built-in LangSmith tracing and run telemetry.

---

### 🐙 2. GitHub Intelligence Hub & Webhook Gateway
- **GitHub App Integration**: Authenticated via RS256 Private Key JWT and short-lived installation access tokens.
- **Security & Webhook Gateway**: HMAC-SHA256 signature verification and idempotency handling for `push`, `pull_request`, and `installation` events.
- **Direct REST API Fallback Sync**: High-speed fallback synchronization directly querying GitHub REST APIs for instant localhost development.
- **"Since You Were Away" Executive AI Digest**: Gemini-powered activity synthesis summarizing pushes, PRs, and branch changes since your previous login.
- **Task ↔ PR Heuristic Correlation**: Automated semantic correlation linking pull requests to open tasks with single-click task resolution.
- **Live Commits & PRs Stream**: Real-time activity timeline with commit SHA badges, branch tracking, and direct GitHub links.

---

### 📋 3. Interactive Drag-and-Drop Task Board
- **Kanban Workflow**: Drag-and-drop cards between **Todo**, **In Progress**, and **Done** columns with optimistic UI updates.
- **Multi-Assignee Support**: Assign tasks to multiple workspace members simultaneously.
- **Automated Email Alerts**: Optional instant email dispatch to assignees upon task assignment.
- **Role Permissions**: Admin-exclusive task creation and editing controls with transparent member view modes.

---

### 💬 4. Real-Time Chat & Strict-Privacy Direct Messaging
- **Real-Time Messaging**: Powered by Supabase Realtime WebSocket broadcasting with presence tracking.
- **Strict Privacy Direct Messaging (DMs)**: Dedicated private DM channels with strict database-level filtering — direct messages are strictly concealed from third-party workspace members.
- **Admin DM Controls**: Workspace admins can toggle direct messaging permissions workspace-wide.

---

### 📄 5. Document Management & pgvector Semantic RAG
- **Rich Document Editor**: Block-based TipTap editor with automated persistence.
- **Multi-Format Ingestion**: Upload PDF (`PyMuPDF`), Word (`python-docx`), TXT, Markdown, CSV, and Excel documents.
- **Vector Search Engine**: Automated 500-word overlapping text chunking embedded into 768-dimensional vectors with Google `text-embedding-004` and indexed in PostgreSQL via `pgvector`.

---

### 🏢 6. Multi-Tenant Workspaces & Role Hierarchy
- **Multi-Tenant Isolation**: Switch between isolated workspaces seamlessly.
- **Expiring Invite Links**: 7-day secure invite codes with owner-controlled code regeneration.
- **Admin Workspace Settings**:
  - Daily AI prompt limits per member
  - Direct messaging enable/disable
  - File upload restrictions
  - Member role management (Admin / Member promotions and removals)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Client (Next.js 14)                               │
│     Zustand (Global State) ── TanStack Query (Caching) ── Lucide / UI       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / WebSocket
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                           FastAPI Backend                                   │
│  Auth ── Workspaces ── Tasks ── Documents ── GitHub Hub ── LangGraph AI     │
└───────┬──────────────────────────────┬───────────────────────────────┬──────┘
        │                              │                               │
┌───────▼──────────────┐   ┌───────────▼───────────┐      ┌────────────▼────────────┐
│ PostgreSQL (Supabase)│   │  LangGraph + Gemini   │      │       GitHub API        │
│ ├── Relational Data  │   │ ├── ReAct Agent Loop  │      │ ├── Webhook Gateway     │
│ ├── pgvector Search  │   │ ├── Autonomous Tools  │      │ ├── Installation Tokens │
│ └── Realtime Chat    │   │ └── LangSmith Tracing │      │ └── Commit / PR Sync    │
└──────────────────────┘   └───────────────────────┘      └─────────────────────────┘
```

### 🤖 LangGraph Agentic AI Loop

```
User Prompt (e.g., "What tasks are due this week and what did we discuss about auth?")
                             │
                             ▼
               LangGraph ReAct Agent Node
                             │
            ┌────────────────┴────────────────┐
            │ Autonomous Tool Selection       │
            ▼                                 ▼
   [search_workspace]                   [get_tasks]
            │                                 │
            ▼                                 ▼
   Query pgvector RAG                Fetch Active Tasks
            │                                 │
            └────────────────┬────────────────┘
                             │
                             ▼
              Gemini 2.5 Flash Synthesis
                             │
                             ▼
         Action Output + Tool Audit Telemetry
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Zustand, TanStack Query, TipTap |
| **Backend API** | FastAPI, SQLAlchemy ORM, Pydantic v2, Uvicorn, Python-JOSE, Passlib (Bcrypt) |
| **Agentic AI & RAG** | LangGraph, LangChain, Google Gemini 2.5 Flash, Google `text-embedding-004`, LangSmith |
| **Database & Realtime** | PostgreSQL, pgvector extension, Supabase Storage, Supabase Realtime WebSockets |
| **Integrations** | GitHub REST API, GitHub Apps (RS256 JWT Auth), HMAC-SHA256 Webhooks, SMTP Mailer |
| **DevOps & Tooling** | Docker, Docker Compose, PyMuPDF, python-docx, httpx |

---

## 🚦 Getting Started

### Prerequisites
- **Node.js 20+**
- **Python 3.11+**
- **Docker Desktop** (Optional, for containerized run)
- **Supabase Project** (Database, Auth, and Storage)
- **Google AI Studio API Key** ([Get free key](https://aistudio.google.com/))

---

### 1. Clone the Repository

```bash
git clone https://github.com/avadhesh11/Nexus.git
cd Nexus
```

---

### 2. Configure Database & pgvector in Supabase

In your Supabase SQL Editor, run:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create Embeddings table for RAG
CREATE TABLE IF NOT EXISTS embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL,
    source_type TEXT NOT NULL,
    source_id UUID NOT NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(768),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cosine index for ultra-fast vector retrieval
CREATE INDEX IF NOT EXISTS embeddings_vector_idx ON embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Match embeddings stored procedure
CREATE OR REPLACE FUNCTION match_embeddings(
    query_embedding vector(768),
    match_workspace_id UUID,
    match_count INT DEFAULT 5
)
RETURNS TABLE (
    id UUID, content TEXT, source_type TEXT,
    source_id UUID, similarity FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT e.id, e.content, e.source_type, e.source_id,
           1 - (e.embedding <=> query_embedding) AS similarity
    FROM embeddings e
    WHERE e.workspace_id = match_workspace_id
    ORDER BY e.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
```

---

### 3. Environment Variables

#### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
JWT_SECRET=your-super-secret-jwt-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080

# Supabase
SUPABASE_URL=https://[your-ref].supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-role-key

# Google Gemini AI & LangGraph
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
LANGSMITH_API_KEY=your-langsmith-api-key
LANGCHAIN_TRACING_V2=true
LANGSMITH_PROJECT=nexus-ai

# GitHub App Integration
GITHUB_APP_ID=your-github-app-id
GITHUB_APP_SLUG=your-app-slug
GITHUB_WEBHOOK_SECRET=your-webhook-secret
GITHUB_APP_PRIVATE_KEY_PATH=nexus-private-key.pem

# SMTP Email Dispatch
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
```

#### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SUPABASE_URL=https://[your-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

### 4. Running Locally

#### Run with Docker Compose (Recommended)
```bash
docker-compose up --build
```

#### Run Manually

**Start Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

**Start Frontend:**
```bash
cd frontend
npm install
npm run dev
```

- **Frontend App**: `http://localhost:3000`
- **FastAPI Documentation**: `http://localhost:8000/docs`

---

## 📖 API Endpoints Reference

### 🔐 Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user account |
| `POST` | `/api/auth/login` | Login and receive JWT access token |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |

### 🏢 Workspaces & Members
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/workspaces/` | Create new workspace |
| `GET` | `/api/workspaces/` | List user's workspaces |
| `GET` | `/api/workspaces/{id}` | Get workspace details |
| `POST` | `/api/workspaces/join/{code}` | Join workspace via invite code |
| `POST` | `/api/workspaces/{id}/regenerate-invite` | Regenerate 7-day invite code |
| `GET` | `/api/workspaces/{id}/activity` | Real-time workspace activity feed |
| `GET` | `/api/workspaces/{id}/settings` | Get workspace admin settings & limits |
| `PATCH` | `/api/workspaces/{id}/settings` | Update workspace admin settings |
| `GET` | `/api/workspaces/{id}/members` | List members and roles |
| `PATCH` | `/api/workspaces/{id}/members/{m_id}/role` | Update member role |
| `DELETE` | `/api/workspaces/{id}/members/{m_id}` | Remove workspace member |

### 🤖 LangGraph Agentic AI
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/chat` | Send prompt to LangGraph ReAct Agent with autonomous tools |
| `GET` | `/api/ai/{ws_id}/sessions` | List persistent AI chat sessions |
| `POST` | `/api/ai/{ws_id}/sessions` | Create new named AI session |
| `GET` | `/api/ai/{ws_id}/sessions/{s_id}/messages` | Get session chat history |
| `PATCH` | `/api/ai/{ws_id}/sessions/{s_id}` | Rename AI chat session |
| `DELETE` | `/api/ai/{ws_id}/sessions/{s_id}` | Delete AI chat session |
| `DELETE` | `/api/ai/{ws_id}/history` | Clear all AI chat history |

### 🐙 GitHub Intelligence
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/integrations/github/install-url` | Get GitHub App installation URL |
| `GET` | `/api/integrations/github/status` | Check GitHub App connection status |
| `POST` | `/api/integrations/github/connect` | Link installation ID to workspace |
| `GET` | `/api/integrations/github/repositories` | List monitored repositories |
| `POST` | `/api/integrations/github/repositories/sync` | Sync & prune repositories & commits |
| `POST` | `/api/integrations/github/repositories/toggle` | Toggle repository tracking |
| `GET` | `/api/github/since-last-seen` | AI "Since You Were Away" executive digest |
| `POST` | `/api/webhooks/github` | Webhook gateway (HMAC-SHA256 verified) |
| `POST` | `/api/tasks/{t_id}/suggestions/{s_id}/accept` | Accept PR-to-task correlation |

### 📋 Tasks & Board
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks/?workspace_id={id}` | List tasks by status/priority |
| `POST` | `/api/tasks/` | Create task with multi-assignees |
| `PATCH` | `/api/tasks/{id}` | Update task status, priority, title |
| `DELETE` | `/api/tasks/{id}` | Delete task |

### 📄 Documents & RAG
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/documents/?workspace_id={id}` | List workspace documents |
| `POST` | `/api/documents/` | Create new document |
| `GET` | `/api/documents/{id}` | Get document content |
| `PATCH` | `/api/documents/{id}` | Update document (auto-re-embeds) |
| `DELETE` | `/api/documents/{id}` | Delete document and vector embeddings |
| `POST` | `/api/documents/upload` | Upload & extract PDF/DOCX to RAG |

### 💬 Real-Time Chat
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat/{ws_id}/messages` | Send channel or private DM |
| `GET` | `/api/chat/{ws_id}/messages` | Query chat history (public or DMs) |

---

## 🔒 Security & Privacy

- **Stateless JWT Tokens**: 7-day cryptographically signed authentication.
- **HMAC-SHA256 Webhook Verification**: Cryptographic validation on every incoming GitHub webhook payload.
- **Granular Role-Based Access Control**: Server-side permission guards on admin actions, task mutation, and workspace settings.
- **Strict Privacy Direct Messaging**: DM payloads are strictly partitioned and query-filtered at the database level.
- **Prompt Injection Defense**: Guardrails in agent system prompts preventing role overriding and malicious HTML/JS injection.

---

## 🤝 Contributing

Contributions are welcome! Follow these steps:
1. Fork the project.
2. Create a feature branch (`git checkout -b feat/my-cool-feature`).
3. Commit your changes (`git commit -m 'feat: add my feature'`).
4. Push to the branch (`git push origin feat/my-cool-feature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

<div align="center">
  <sub>Built with ❤️ using FastAPI, Next.js 14, LangGraph, and Google Gemini 2.5 Flash.</sub>
</div>
