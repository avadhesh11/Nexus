# Nexus
# Nexus — The Unified Agentic Workspace

> Docs, chat, tasks, and AI memory — unified. Nexus AI treats AI as a first-class teammate, not a chatbot on the side.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688?style=flat-square&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker)
![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?style=flat-square&logo=google)

---

## What is Nexus?

Nexus is a next-generation collaborative workspace platform that unifies team communication, documentation, project management, and intelligent AI automation into a single ecosystem.

Unlike traditional tools where AI is just a chatbot panel, Nexus AI uses an **Agentic RAG (Retrieval-Augmented Generation)** architecture — the AI has memory of every document, task, and message in your workspace and can answer questions using your team's actual content.

---

## Features

### Core Collaboration
- **Multi-workspace support** — create and join workspaces via invite codes
- **Real-time team chat** — powered by Supabase Realtime with presence indicators
- **Block-based document editor** — TipTap rich text editor with auto-save
- **Kanban task board** — Todo / In Progress / Done with priority levels

### AI Intelligence
- **RAG Pipeline** — every document is automatically chunked, embedded, and stored in pgvector
- **Semantic workspace search** — ask questions, get answers from your actual docs
- **Agentic AI Workspace Assistant** — tool-calling & context-aware memory via LangGraph
- **Context-aware AI** — Gemini 2.5 Flash knows your workspace content

### Developer Experience
- **JWT authentication** — secure, stateless auth with 7-day tokens
- **Role-based access** — Admin, Member, Viewer per workspace
- **File upload** — extract text from PDF and Word documents into RAG pipeline
- **Fully containerized** — Docker Compose for one-command local setup

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 14 (App Router) | React framework with SSR |
| TypeScript | Type safety |
| Tailwind CSS v3 | Styling |
| Zustand | Global state (auth, workspace) |
| TanStack Query | Server state + caching |
| TipTap | Rich text document editor |
| Supabase JS | Realtime chat subscriptions |
| Axios | HTTP client with JWT interceptor |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | Python web framework |
| SQLAlchemy | ORM for PostgreSQL |
| Pydantic | Request/response validation |
| Passlib + bcrypt | Password hashing |
| Python-JOSE | JWT generation and validation |
| Google GenAI SDK | Gemini 2.5 Flash + embeddings |
| Supabase Python | Vector storage + realtime |
| PyMuPDF + python-docx | PDF and Word text extraction |

### Infrastructure
| Technology | Purpose |
|---|---|
| PostgreSQL (Supabase) | Primary database |
| pgvector | Vector similarity search |
| Supabase Realtime | WebSocket broadcasting |
| Docker + Docker Compose | Containerization |
| Langsmith | AI Orchestration            |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Browser                            │
│                   Next.js 14 App                        │
│         Zustand ──── TanStack Query ──── Axios          │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP / SSE
┌──────────────────────────▼──────────────────────────────┐
│                    FastAPI Backend                      │
│   Auth ── Workspaces ── Documents ── Tasks ── AI        │
└──────────┬───────────────────────────────┬──────────────┘
           │                               │
┌──────────▼───────────┐       ┌────────────▼────────────┐
│  PostgreSQL          │       │   Google Gemini API     │
│  (Supabase)          │       │   gemini-2.5-flash      │
│                      │       │   text-embedding-004    │
│  ┌─────────────┐     │       └─────────────────────────┘
│  │  pgvector   │     │
│  │  embeddings │     │
│  └─────────────┘     │
└──────────────────────┘
           │
┌──────────▼──────────┐
│  Supabase Realtime  │
│  (chat broadcasts)  │
└─────────────────────┘
```

### RAG Pipeline

```
Document created/updated
         ↓
chunker.py → splits into 500-word overlapping chunks
         ↓
embedder.py → Gemini text-embedding-004 → 768-dim vectors
         ↓
pgvector → stored with workspace_id, source_type, source_id
         ↓
User asks AI a question
         ↓
Question embedded → cosine similarity search → top 5 chunks
         ↓
Chunks injected into Gemini prompt as context
         ↓
Gemini answers using your actual workspace content
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 20+
- Docker Desktop
- Supabase account (free tier)
- Google AI Studio API key (free)

### 1. Clone the repository

```bash
git clone https://github.com/avadhesh11/Nexus.git
cd Nexus
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run:

```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Embeddings table
CREATE TABLE embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL,
    source_type TEXT NOT NULL,
    source_id UUID NOT NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(768),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector similarity search index
CREATE INDEX ON embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Similarity search function
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

3. Go to **Database → Replication** and enable realtime for the `messages` table

### 3. Configure environment variables

Create `backend/.env`:
```env
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
JWT_SECRET=your-super-secret-key-change-this
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080
SUPABASE_URL=https://[ref].supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
PRODUCTION=False (for localhost)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER= your_email_account (with 2FA verification on and add app)
SMTP_PASS= your_email_pass generated after following the above step
LANGSMITH_API_KEY= your_langsmith_api_key
LANGCHAIN_TRACING_V2=true
LANGSMITH_PROJECT= your_langsmith_project
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run with Docker (recommended)

Create root `.env`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

```bash
docker-compose up --build
```

- Frontend → http://localhost:3000
- Backend API → http://localhost:8000
- API Docs → http://localhost:8000/docs

### 5. Run without Docker

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## API Reference

### Auth
```
POST /api/auth/register    → { email, password } → { access_token }
POST /api/auth/login       → { email, password } → { access_token }
GET  /api/auth/me          → User object
```

### Workspaces
```
POST   /api/workspaces/              → Create workspace
GET    /api/workspaces/              → List my workspaces
GET    /api/workspaces/:id           → Get workspace
POST   /api/workspaces/join/:code    → Join via invite code
DELETE /api/workspaces/:id           → Delete (admin only)
```

### Documents
```
POST   /api/documents/               → Create document
GET    /api/documents/?workspace_id= → List documents
GET    /api/documents/:id            → Get document
PATCH  /api/documents/:id            → Update (auto-embeds)
DELETE /api/documents/:id            → Delete
POST   /api/documents/upload         → Upload PDF/DOCX
```

### Chat
```
POST /api/chat/:workspace_id/messages          → Send message
GET  /api/chat/:workspace_id/messages?limit=50 → Get history
```

### Tasks
```
POST   /api/tasks/              → Create task
GET    /api/tasks/?workspace_id=→ List tasks (filter by status)
PATCH  /api/tasks/:id           → Update status/assignee
DELETE /api/tasks/:id           → Delete task
```

### AI
```
POST /api/ai/chat         → RAG & Agentic chat response
```

---

## Project Structure

```
nexus/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry
│   │   ├── database.py          # SQLAlchemy connection
│   │   ├── models.py            # DB models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── dependencies.py      # JWT auth guard
│   │   ├── agents/              # LangGraph Agent & Tools
│   │   │   ├── agent.py         # Agent execution logic
│   │   │   ├── state.py         # Agent state definition
│   │   │   └── tools.py         # Agent tools (tasks, search, email)
│   │   ├── rag/                 # RAG pipeline
│   │   │   ├── chunker.py       # Text splitting
│   │   │   ├── embedder.py      # Vector generation
│   │   │   └── vector_store.py  # pgvector operations
│   │   ├── routes/              # API endpoints
│   │   │   ├── ai.py
│   │   │   ├── auth.py
│   │   │   ├── chat.py
│   │   │   ├── documents.py
│   │   │   ├── tasks.py
│   │   │   └── workspaces.py
│   │   └── utils/               # Helper utility files
│   │       ├── document_parser.py # PDF/docx parsing
│   │       ├── gemini_client.py  # Gemini API client
│   │       ├── redis_client.py   # Redis client
│   │       └── supabase_client.py # Supabase client connection
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (app)/dashboard/
│   │   │   ├── layout.tsx       # Sidebar + topbar
│   │   │   ├── page.tsx         # Dashboard home
│   │   │   ├── documents/
│   │   │   ├── chat/
│   │   │   ├── tasks/
│   │   │   └── ai/
│   │   └── page.tsx             # Landing page
│   ├── components/app/
│   ├── lib/                     # api.ts, supabase.ts, utils.ts
│   ├── store/                   # Zustand stores
│   ├── types/                   # TypeScript types
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

## Deployment

### Frontend → Vercel

```bash
cd frontend
npx vercel --prod
```

Add environment variables in Vercel dashboard:
- `NEXT_PUBLIC_API_URL` 
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`


---

## Roadmap

- [x] JWT Authentication
- [x] Multi-workspace collaboration
- [x] Real-time team chat
- [x] Block-based document editor
- [x] Kanban task board
- [x] RAG pipeline with pgvector
- [x] Gemini AI with tool calling (LangGraph)
- [x] PDF/Word file upload + extraction
- [x] Docker containerization
- [ ] Standup agent (auto-generates daily standups)
- [ ] Task suggestion from chat context
- [ ] GitHub PR → documentation sync
- [ ] Prometheus + Grafana observability

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Commit your changes (`git commit -m 'feat: add your feature'`)
4. Push to the branch (`git push origin feat/your-feature`)
5. Open a Pull Request

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <p>Built with FastAPI + Next.js + Gemini 2.5 Flash</p>
  <p>⭐ Star this repo if you found it useful</p>
</div>
