# Nexus AI — Enterprise Collaborative Workspace & Agentic System

> **A unified, production-grade enterprise workspace combining autonomous LangGraph ReAct agents, pgvector semantic retrieval (RAG), visual workflow canvases, GitHub App intelligence with HMAC webhook ingestion, strict-privacy real-time communication, and dual-layer Redis performance caching.**

---

## Table of Contents

- [1. Executive Summary](#1-executive-summary)
- [2. Project Overview](#2-project-overview)
  - [Problem Statement](#problem-statement)
  - [Target Users & Primary Use Cases](#target-users--primary-use-cases)
  - [Key Architectural Differentiators](#key-architectural-differentiators)
- [3. Feature Breakdown](#3-feature-breakdown)
  - [Nexus Flow: Interactive Workflow & Flowchart Canvas](#nexus-flow-interactive-workflow--flowchart-canvas)
  - [LangGraph Autonomous AI Agent & Dynamic Tool Engine](#langgraph-autonomous-ai-agent--dynamic-tool-engine)
  - [Document Ingestion & pgvector RAG Pipeline](#document-ingestion--pgvector-rag-pipeline)
  - [GitHub Intelligence Hub & Webhook Gateway](#github-intelligence-hub--webhook-gateway)
  - [Real-Time Chat & Strict-Privacy Direct Messaging](#real-time-chat--strict-privacy-direct-messaging)
  - [Interactive Kanban Task Management & Automated Dispatch](#interactive-kanban-task-management--automated-dispatch)
  - [Multi-Tenant Workspace Isolation & RBAC Governance](#multi-tenant-workspace-isolation--rbac-governance)
  - [High-Performance Redis Caching & Activity Synthesis](#high-performance-redis-caching--activity-synthesis)
- [4. Technology Stack](#4-technology-stack)
- [5. System Architecture](#5-system-architecture)
  - [High-Level System Topology](#high-level-system-topology)
  - [Frontend-to-Backend Request Lifecycle](#frontend-to-backend-request-lifecycle)
  - [Dual-Cookie Authentication & Token Rotation Flow](#dual-cookie-authentication--token-rotation-flow)
  - [Database Interaction & Connection Pooling Strategy](#database-interaction--connection-pooling-strategy)
  - [LangGraph ReAct Agent Execution Loop](#langgraph-react-agent-execution-loop)
  - [RAG Ingestion, Chunking & Semantic Search Flow](#rag-ingestion-chunking--semantic-search-flow)
  - [GitHub App Webhook Ingestion & Task Correlation Flow](#github-app-webhook-ingestion--task-correlation-flow)
  - [Supabase Realtime Messaging Flow](#supabase-realtime-messaging-flow)
- [6. Repository Structure](#6-repository-structure)
- [7. Frontend Architecture](#7-frontend-architecture)
- [8. Backend Architecture](#8-backend-architecture)
- [9. Complete API Reference](#9-complete-api-reference)
  - [System Health](#system-health)
  - [Authentication Routes](#authentication-routes)
  - [Workspace Management Routes](#workspace-management-routes)
  - [Document Management & Ingestion Routes](#document-management--ingestion-routes)
  - [Task Management Routes](#task-management-routes)
  - [Chat & Direct Messaging Routes](#chat--direct-messaging-routes)
  - [Agentic AI Routes](#agentic-ai-routes)
  - [GitHub Integration & Webhook Routes](#github-integration--webhook-routes)
  - [Nexus Flow Canvas Routes](#nexus-flow-canvas-routes)
- [10. Database Schema & Data Integrity](#10-database-schema--data-integrity)
  - [Entity-Relationship Diagram](#entity-relationship-diagram)
  - [Data Model Reference](#data-model-reference)
  - [Supabase Native Collections & Vector Storage](#supabase-native-collections--vector-storage)
- [11. AI, RAG & Agent Internals](#11-ai-rag--agent-internals)
- [12. Authentication, Authorization & Security](#12-authentication-authorization--security)
- [13. Setup & Local Development](#13-setup--local-development)
  - [Prerequisites](#prerequisites)
  - [Supabase Schema & Vector Extension Initialization](#supabase-schema--vector-extension-initialization)
  - [Environment Configuration](#environment-configuration)
  - [Running via Docker Compose](#running-via-docker-compose)
  - [Running Backend & Frontend Manually](#running-backend--frontend-manually)
- [14. Configuration Reference](#14-configuration-reference)
- [15. Deployment Architecture](#15-deployment-architecture)
- [16. Testing, Load Benchmarking & Observability](#16-testing-load-benchmarking--observability)
  - [Empirical Redis Cache Benchmarks](#empirical-redis-cache-benchmarks)
  - [Locust Concurrency & Load Testing](#locust-concurrency--load-testing)
  - [Current Testing Limitations](#current-testing-limitations)
- [17. Error Handling & Troubleshooting Guide](#17-error-handling--troubleshooting-guide)
- [18. Performance Optimizations & Trade-Offs](#18-performance-optimizations--trade-offs)
- [19. Technical Debt & Future Improvements](#19-technical-debt--future-improvements)
- [20. Technical Interview Preparation](#20-technical-interview-preparation)
  - [60-Second Elevator Pitch](#60-second-elevator-pitch)
  - [3-Minute Deep Dive](#3-minute-deep-dive)
  - [10 Core Architecture & Implementation Questions](#10-core-architecture--implementation-questions)
  - [5 System Design & Trade-Off Questions](#5-system-design--trade-off-questions)
  - [5 Failure Scenarios & Debugging Questions](#5-failure-scenarios--debugging-questions)
  - [Key Source Files to Review Before an Interview](#key-source-files-to-review-before-an-interview)
- [21. Glossary & References](#21-glossary--references)

---

## 1. Executive Summary

**Nexus AI** is an enterprise-grade collaborative workspace application engineered with a **FastAPI (Python 3.11/3.12)** backend and a **Next.js 14 (App Router, TypeScript)** frontend. Unlike conventional productivity tools that embed AI as an isolated conversational widget, Nexus AI treats artificial intelligence as an **active, autonomous team actor** operating inside the application state.

Nexus AI delivers:
1. **LangGraph ReAct AI Agents**: Autonomous multi-step reasoning powered by Google Gemini 2.5 Flash, dynamically binding contextual tools (vector retrieval, task CRUD, team chat querying, and automated SMTP notifications) based on workspace role authorization.
2. **End-to-End Multimodal RAG**: Document parsing (PDF, DOCX, CSV, Excel, TXT, Markdown), 1000-word sliding-window chunking with 50-word overlap, 768-dimensional semantic vector generation via Google `gemini-embedding-2-preview`, and sub-millisecond IVFFlat cosine similarity matching in PostgreSQL (`pgvector`).
3. **Nexus Flow Canvas**: An interactive node-based flowchart and architecture canvas powered by `@xyflow/react`, enabling teams to model pipelines, bind canvas steps directly to workspace tasks and documents, create snapshot versions, and trigger Gemini-driven end-to-end SOP and bottleneck analysis.
4. **GitHub Intelligence Hub**: Enterprise GitHub App integration operating over RS256 JWT tokens, installation token lifecycle caching, HMAC-SHA256 webhook signature verification, heuristic PR-to-task correlation, and an AI-powered "Since You Were Away" executive digest backed by deterministic SHA-256 fingerprint caching.
5. **Strict-Privacy Real-Time Messaging**: Supabase Realtime WebSocket broadcasting for public channels, alongside database-isolated Direct Messaging channels that prevent third-party member data leakage.
6. **Production Security Architecture**: Dual HttpOnly cookie authentication (15-minute access JWT, 7-day refresh JWT), Argon2 password hashing, SlowAPI token-bucket rate limiting, and database-level multi-tenant workspace isolation.

---

## 2. Project Overview

### Problem Statement
Modern software engineering and product teams juggle fragmented point solutions: Jira or Linear for task tracking, Notion or Google Docs for specifications, Slack or Discord for communication, GitHub for code reviews, and Miro or Lucidchart for architecture diagrams. Context is fragmented, developers experience notification fatigue, and standalone AI chatbots lack access to the real-time operational state of the team's codebase, tasks, and discussions.

### Target Users & Primary Use Cases
- **Engineering Teams**: Correlating GitHub Pull Requests and commits to open tasks, generating AI digests of repository activity across sprints, and designing architecture diagrams that link directly to requirements.
- **Product Managers & Leads**: Ingesting PRDs, customer feedback documents, and spreadsheets into a vector database to query project scope, generate automated task boards, and broadcast email notifications for approaching deadlines.
- **System Architects & DevOps**: Modeling deployment pipelines, incident war rooms, and CI/CD triage workflows on visual node canvases with automated Gemini post-mortem and SOP generation.

### Key Architectural Differentiators
- **Code-Level Verification**: Built from a real, functioning codebase containing verified route handlers, Pydantic validation schemas, SQLAlchemy relational models, and Supabase vector procedures.
- **Role-Aware Dynamic Tool Invocations**: The LangGraph agent does not expose administrative tools (such as mutating tasks or dispatching company-wide emails) to regular workspace members. Privilege checks are baked into closures at the tool generation layer.
- **Deterministic SHA-256 Development Fingerprint Caching**: High-frequency dashboard visits avoid redundant LLM inference calls by hashing the state of pull requests and commits. If the repository activity has not changed, the system serves the cached AI synthesis at 0 API cost.
- **Dual Connection Pool Strategy**: The database connection layer inspects the connection string to dynamically switch between `QueuePool` for local load tests and `NullPool` for cloud PostgreSQL instances, avoiding connection exhaustion on capped serverless tiers.

---

## 3. Feature Breakdown

### Nexus Flow: Interactive Workflow & Flowchart Canvas
- **What it does**: Provides a visual flowchart, pipeline, and architecture designer on an infinite canvas with minimap navigation, grid snapping, and node controls.
- **User Interaction**: Users drag and drop modular nodes, connect source and target handles with labeled edges, link nodes to workspace documents or tasks, record node-level comments with team email attribution, save named point-in-time graph versions, and click **AI Explain** for Gemini synthesis.
- **Node Types**:
  - `TriggerNode` (Purple): Webhooks, schedules, GitHub events, and entry points.
  - `ActionNode` (Blue): CI/CD steps, Docker builds, alerts, and task execution.
  - `DecisionNode` (Amber): Branching condition gates with condition labels.
  - `DelayNode` (Pink): Timers, staging soak periods, and approval pauses.
  - `NoteNode` (Yellow): SOP documentation cards and team notes.
- **Implementation Modules**:
  - Frontend: `frontend/app/(app)/dashboard/flows/[id]/page.tsx`, `frontend/app/(app)/dashboard/flows/page.tsx` using `@xyflow/react`, `html-to-image`.
  - Backend: `backend/app/routes/flows.py`, models `Flow`, `FlowNode`, `FlowEdge`, `FlowComment`, `FlowVersion` in `backend/app/models.py`.
- **Known Limitations**: Node and edge updates are persisted upon explicit clicking of the "Save Changes" button via `/api/flows/{id}/sync` (batch transaction) rather than operational transformation (OT) collaborative cursor editing.

### LangGraph Autonomous AI Agent & Dynamic Tool Engine
- **What it does**: Executes multi-turn reasoning and tool orchestration via a ReAct agent loop powered by Google Gemini 2.5 Flash and LangGraph.
- **User Interaction**: Users interact via a conversational chat interface with session management, automated first-prompt session titling, markdown rendering, tool execution badges, and daily quota meters.
- **Available Tools**:
  - `search_workspace`: Cosine similarity search against vectorized workspace documentation.
  - `get_tasks`: Queries workspace task board filtered by status.
  - `get_recent_chat`: Reads recent messages from workspace chat for discussion context.
  - `create_task` *(Admin Only)*: Creates and assigns tasks to members.
  - `update_task` *(Admin Only)*: Mutates task status, priority, or titles.
  - `send_task_reminder_email` *(Admin Only)*: Dispatches HTML task reminder emails to workspace members via SMTP.
  - `send_deadline_alert_email` *(Admin Only)*: Flags overdue tasks and tasks due within 48 hours to assignees.
  - `send_important_info_email` *(Admin Only)*: Broadcasts announcements to all workspace members.
- **Implementation Modules**:
  - Backend: `backend/app/agents/agent.py`, `backend/app/agents/tools.py`, `backend/app/routes/ai.py`.
  - Frontend: `frontend/app/(app)/dashboard/ai/page.tsx`.

### Document Ingestion & pgvector RAG Pipeline
- **What it does**: Parses uploaded documents into structural text, splits content into sliding-window chunks, generates 768-dimensional embeddings, and writes vectors to PostgreSQL for similarity matching.
- **Supported Formats**:
  - `PDF`: Extracted using `pdfplumber`, parsing paragraph blocks and rendering tables as markdown-delimited strings (`| col | col |`).
  - `DOCX`: Extracted using `python-docx`, parsing paragraphs and deduplicating merged table cells.
  - `CSV` & `Excel (.xlsx, .xls)`: Extracted using `pandas` via `read_csv` and `read_excel`, exported to string tables.
  - `TXT` & `Markdown (.md)`: UTF-8 decoded with replacement error handling.
- **Implementation Modules**:
  - Backend: `backend/app/utils/document_parser.py`, `backend/app/rag/chunker.py`, `backend/app/rag/embedder.py`, `backend/app/rag/vector_store.py`, `backend/app/routes/documents.py`.
  - Frontend: `frontend/app/(app)/dashboard/documents/page.tsx`, `frontend/components/app/DocumentEditor.tsx` (TipTap rich editor).
- **Known Limitations**: File upload size is hard-capped at 10 MB (`MAX_FILE_SIZE = 10 * 1024 * 1024`). Deleting a document removes the database row; vector rows in `embeddings` are replaced during updates but not explicitly cleared on single document deletions.

### GitHub Intelligence Hub & Webhook Gateway
- **What it does**: Integrates with GitHub via GitHub App authentication (RS256 Private Key JWT) and webhooks. Pulls and monitors repositories, ingests commits and pull requests, matches PRs to open workspace tasks via semantic heuristic scoring, and generates executive summaries.
- **Webhook Ingestion**: Authenticated via `X-Hub-Signature-256` HMAC-SHA256 cryptographic signature validation. Employs `delivery_id` idempotency checks to prevent duplicate processing. Handles `installation`, `push`, and `pull_request` events asynchronously via FastAPI `BackgroundTasks`.
- **Heuristic PR ↔ Task Correlation**: Evaluates word overlap between PR title, head branch, body, and open workspace tasks. Links scoring $\ge 0.4$ are presented as suggestions on the task board; accepting a suggestion optionally transitions the task status to `done`.
- **Implementation Modules**:
  - Backend: `backend/app/routes/github.py`, `backend/app/services/github_app.py`, `backend/app/utils/development_cache.py`.
  - Frontend: `frontend/app/(app)/dashboard/integrations/page.tsx`.

### Real-Time Chat & Strict-Privacy Direct Messaging
- **What it does**: Real-time communication separating workspace-wide channel discussions (`#general`) from private peer-to-peer Direct Messages (DMs).
- **Privacy Model**: Channel messages have `recipient_id = NULL`. Direct messages store the target recipient's user ID. Both the REST API query (`/api/chat/{ws_id}/messages`) and activity feed (`/api/workspaces/{ws_id}/activity`) filter messages so third-party members cannot view private exchanges.
- **Implementation Modules**:
  - Backend: `backend/app/routes/chat.py`, `backend/app/utils/supabase_client.py`.
  - Frontend: `frontend/app/(app)/dashboard/chat/page.tsx` utilizing Supabase Realtime WebSocket subscriptions on table `messages`.

### Interactive Kanban Task Management & Automated Dispatch
- **What it does**: Drag-and-drop task workflow across `Todo`, `In Progress`, and `Done` states. Supports multiple assignees, priority levels (`low`, `medium`, `high`), due dates, and automated HTML email notifications via SMTP.
- **Permissions**: Only workspace administrators can create or delete tasks (`check_is_workspace_admin`). Workspace members can update task states and reorder them across columns.
- **Implementation Modules**:
  - Backend: `backend/app/routes/tasks.py`, models `Task`, `TaskAssignee` in `backend/app/models.py`.
  - Frontend: `frontend/app/(app)/dashboard/tasks/page.tsx`.

### Multi-Tenant Workspace Isolation & RBAC Governance
- **What it does**: Logical tenant partitioning where all resources (documents, tasks, flows, chat messages, AI sessions, GitHub repositories) belong to a `workspace_id`.
- **Role Hierarchy**:
  - `owner`: Workspace creator. Possesses irrevocable administrator authority, manages billing/settings, and cannot be removed.
  - `admin`: Can modify workspace settings, manage member roles, create tasks, and execute email tools.
  - `member`: Standard collaborator with document, flow, task viewing, and messaging capabilities.
  - `viewer`: Read-only access tier.
- **Invite Engine**: Cryptographically secure 8-byte URL-safe invite codes (`secrets.token_urlsafe(8)`) with a 7-day expiration timestamp (`invite_expires_at`). Owners can regenerate invite codes at any time.

### High-Performance Redis Caching & Activity Synthesis
- **Activity Cache**: Caches the high-traffic `/api/workspaces/{id}/activity` feed for 15 seconds per user session, aggregating recent documents, tasks, joins, GitHub commits, and chat messages.
- **Development Cache**: Computes deterministic SHA-256 fingerprints of active PRs and commits. If the fingerprint matches the cached value in Redis, the LLM synthesis is served instantly with zero token consumption. Automatically falls back to an in-memory dictionary if Redis is unavailable.

---

## 4. Technology Stack

| Layer | Technology | Purpose in Nexus AI | Scope & Usage | Dependency Type |
|---|---|---|---|---|
| **Frontend Framework** | **Next.js 14.2** | React App Router framework, server/client components, route handlers | Entire frontend client | Core Infrastructure |
| **Language (Web)** | **TypeScript 5.x** | Static typing for components, API contracts, and stores | Entire frontend codebase | Core Infrastructure |
| **Styling & Design** | **Tailwind CSS 3.4** | Utility-first CSS styling, customized glassmorphic design system | All UI layouts & screens | Core Infrastructure |
| **Canvas & Diagrams** | **@xyflow/react 12.11** | Interactive node-based canvas for Nexus Flow workflow designer | `/dashboard/flows/[id]` | Core Feature Dependency |
| **State Management** | **Zustand 5.0** | Persistent global state for user authentication, current workspace, and UI theme | `frontend/store/` | Core Infrastructure |
| **Data Fetching** | **TanStack Query 5.x** | Server state synchronization, caching, polling, optimistic updates | All dashboard pages | Core Infrastructure |
| **HTTP Client** | **Axios 1.16** | Client-to-backend HTTP requests, 401 token refresh interceptor | `frontend/lib/api.ts` | Core Infrastructure |
| **Realtime Client** | **@supabase/supabase-js 2.45** | WebSocket client for Postgres CDC (Change Data Capture) message streams | `frontend/lib/supabase.ts` | Core Infrastructure |
| **Rich Text Editor** | **TipTap 3.23** | Headless block-based document editor with ProseMirror extensions | `DocumentEditor.tsx` | Core Feature Dependency |
| **Backend Framework** | **FastAPI 0.137** | Async ASGI Python API framework, automatic OpenAPI documentation | Entire backend API | Core Infrastructure |
| **ASGI Web Server** | **Uvicorn 0.46** | Production ASGI server hosting the FastAPI application | Server entry point | Core Infrastructure |
| **Language (API)** | **Python 3.11 / 3.12** | Backend language runtime | Entire backend | Core Infrastructure |
| **ORM & Relational DB** | **SQLAlchemy 2.0** | Relational mapping, models, connection pooling, and migrations | `database.py`, `models.py` | Core Infrastructure |
| **Database** | **PostgreSQL 16** | Primary relational store for workspaces, users, tasks, flows, metadata | Supabase / Docker | Core Infrastructure |
| **Vector Search** | **pgvector** | Vector similarity indexing and cosine search for RAG chunks | PostgreSQL extension | Core Infrastructure |
| **Cache & Memory** | **Redis 7 (redis-py 5.2)** | High-frequency activity caching and SHA-256 fingerprint caching | `redis_client.py` | Core Infrastructure |
| **Agentic Framework** | **LangGraph 1.2** | Stateful ReAct agent loop (`create_react_agent`) with tool calls | `backend/app/agents/` | Core Feature Dependency |
| **LLM Provider** | **Google Gemini 2.5 Flash** | Multi-step agent reasoning, flow analysis, and PR executive summaries | `agent.py`, `flows.py`, `github.py` | Core AI Service |
| **Embedding Model** | **gemini-embedding-2-preview** | Generates 768-dimensional document and query retrieval vectors | `backend/app/rag/embedder.py`| Core AI Service |
| **Document Parsers** | **pdfplumber 0.11 / python-docx / pandas** | Deep text and table extraction from PDF, Word, CSV, Excel | `document_parser.py` | Core Feature Dependency |
| **Password Security** | **Argon2 (argon2-cffi 25.1)** | Memory-hard cryptographic password hashing algorithm | `routes/auth.py` | Security Core |
| **Token Authentication**| **python-jose 3.5 / PyJWT** | HS256 JWT encoding/decoding for cookies, RS256 for GitHub Apps | `auth.py`, `github_app.py` | Security Core |
| **Rate Limiting** | **SlowAPI 0.1.10** | Token-bucket API rate limiting based on remote client IP | `main.py`, `auth.py` | Security Core |
| **Containerization** | **Docker & Docker Compose** | Containerized deployment for Postgres, Redis, backend, frontend | Root configurations | DevOps Infrastructure |
| **Load Testing** | **Locust 2.x** | User-concurrency simulation and performance benchmarking | `app/locustfile.py` | Testing Tooling |

---

## 5. System Architecture

### High-Level System Topology

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT BROWSER                                          │
│                                                                                        │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │                         Next.js 14 App Router                                  │   │
│   │  • Zustand Global Stores (Auth, Workspace, Theme)                              │   │
│   │  • TanStack Query (Server Cache, Polling & Stale-While-Revalidate)             │   │
│   │  • @xyflow/react Canvas (Node/Edge State, Snapshots, Export)                   │   │
│   │  • TipTap Rich Document Editor (Sliding Autosave)                              │   │
│   └──────────────────────────┬─────────────────────────────▲───────────────────────┘   │
└──────────────────────────────┼─────────────────────────────┼───────────────────────────┘
                               │ HTTPS / JSON                │ WebSocket (CDC Events)
                               │ (HttpOnly Cookies)          │
┌──────────────────────────────▼─────────────────────────────┴───────────────────────────┐
│                               NEXUS FASTAPI BACKEND                                    │
│                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Middlewares: CORSMiddleware ➔ SlowAPI Limiter ➔ Exception Handlers ➔ Cookie Auth │  │
│  └──────────────────────────────────────┬───────────────────────────────────────────┘  │
│                                         │                                              │
│  ┌───────────────┬───────────────┬──────┴────────┬───────────────┬──────────────────┐  │
│  │ Auth Router   │ Workspace     │ Documents     │ Tasks Router  │ Flow Canvas      │  │
│  │ (Argon2 / JWT)│ Activity Feed │ RAG Pipeline  │ Multi-Assign  │ Graph Sync / SOP │  │
│  └───────┬───────┴───────┬───────┴──────┬────────┴───────┬───────┴────────┬─────────┘  │
│          │               │              │                │                │            │
│          │               │              │                │                │            │
│  ┌───────▼───────┐ ┌─────▼──────┐ ┌─────▼──────┐ ┌───────▼──────┐  ┌──────▼─────────┐  │
│  │  SQLAlchemy   │ │   Redis    │ │  pgvector  │ │  LangGraph   │  │   GitHub App   │  │
│  │  (QueuePool / │ │  Cache &   │ │   Semantic │ │ ReAct Agent  │  │   Gateway &    │  │
│  │   NullPool)   │ │ Fingerprint│ │  Retrieval │ │  (Gemini)    │  │   HMAC Ingest  │  │
│  └───────┬───────┘ └────────────┘ └─────┬──────┘ └───────┬──────┘  └──────┬─────────┘  │
└──────────┼──────────────────────────────┼────────────────┼────────────────┼────────────┘
           │                              │                │                │
┌──────────▼──────────────────────────────▼────┐    ┌──────▼──────┐  ┌──────▼─────────┐
│              SUPABASE POSTGRESQL             │    │   GOOGLE    │  │   GITHUB API   │
│  • Relational Schema (Users, Tasks, Flows)   │    │  GEMINI AI  │  │ • RS256 JWT    │
│  • vector(768) Embeddings & Cosine Matching  │    │ • 2.5 Flash │  │ • Repos / PRs  │
│  • Realtime Replication (messages table)     │    │ • Embedding │  │ • Webhook POST │
└──────────────────────────────────────────────┘    └─────────────┘  └────────────────┘
```

### Frontend-to-Backend Request Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Browser
    participant Axios as Axios Interceptor (lib/api.ts)
    participant FastApi as FastAPI Gateway (main.py)
    participant Dep as get_current_user (dependencies.py)
    participant Router as Domain Router (e.g., tasks.py)
    participant DB as SQLAlchemy Session (database.py)

    User->>Axios: User triggers action (e.g. Create Task)
    Axios->>FastApi: POST /api/tasks/ (Cookies: access_token)
    FastApi->>FastApi: SlowAPI Rate-Limit Evaluation
    FastApi->>Dep: Invoke get_current_user(request)
    Dep->>Dep: Read request.cookies["access_token"]
    alt Token Missing or Expired
        Dep-->>FastApi: Raise HTTP 401 Unauthorized
        FastApi-->>Axios: HTTP 401 Unauthorized
        Axios->>FastApi: POST /api/auth/refresh (Cookies: refresh_token)
        alt Valid 7-day Refresh Token
            FastApi-->>Axios: Set new access_token & refresh_token cookies
            Axios->>FastApi: Retry original request
        else Refresh Token Expired
            FastApi-->>Axios: HTTP 401 Unauthorized
            Axios-->>User: Redirect to /login
        end
    else Token Valid
        Dep->>DB: Query User record by UUID
        DB-->>Dep: User entity
        Dep-->>Router: Inject current_user
        Router->>Router: Enforce Workspace & Role RBAC
        Router->>DB: Mutate Task & TaskAssignee rows
        DB-->>Router: Commit & Refresh entity
        Router-->>FastApi: Return TaskOut Pydantic schema
        FastApi-->>Axios: HTTP 201 Created (JSON)
        Axios-->>User: Render optimistic UI update
    end
```

### Dual-Cookie Authentication & Token Rotation Flow

Nexus AI eliminates client-side token storage vulnerabilities (such as localStorage XSS extraction) by storing authentication credentials strictly in `HttpOnly`, `SameSite` cookies.

```mermaid
sequenceDiagram
    autonumber
    actor Client as Web Browser
    participant Auth as Auth Router (/api/auth)
    participant Crypt as Passlib (Argon2)
    participant DB as PostgreSQL (users)

    Client->>Auth: POST /api/auth/login {email, password}
    Auth->>DB: Query user by email
    DB-->>Auth: User record (with password hash)
    Auth->>Crypt: verify_password(plain, hashed)
    alt Credentials Invalid
        Crypt-->>Auth: False
        Auth-->>Client: HTTP 401 {"detail": "Invalid credentials"}
    else Credentials Valid
        Crypt-->>Auth: True
        Auth->>Auth: create_access_token(user_id, exp=15m, type="access")
        Auth->>Auth: create_refresh_token(user_id, exp=7d, type="refresh")
        Auth-->>Client: HTTP 200 {"message": "Login successful"} + Set-Cookie headers
        Note over Client,Auth: Cookie 1: access_token (Max-Age=900s, HttpOnly)<br/>Cookie 2: refresh_token (Max-Age=604800s, HttpOnly)
    end
```

### Database Interaction & Connection Pooling Strategy

To resolve the dual challenge of high-throughput local load testing and cloud connection caps, `backend/app/database.py` evaluates the `DATABASE_URL` string upon startup:

```mermaid
flowchart TD
    Start["Backend Startup"] --> CheckEnv{"DATABASE_URL contains<br/>'localhost' or '127.0.0.1'?"}
    
    CheckEnv -- Yes (Local Docker Postgres) --> QueuePoolEngine["SQLAlchemy QueuePool<br/>• pool_size = 30<br/>• max_overflow = 20<br/>• pool_timeout = 30s<br/>• pool_recycle = 1800s<br/>• pool_pre_ping = True"]
    
    CheckEnv -- No (Cloud Supabase / Remote) --> NullPoolEngine["SQLAlchemy NullPool<br/>• Disables persistent idle pools<br/>• Opens connection per request<br/>• Prevents exhausting Supabase 25-conn cap<br/>• pool_pre_ping = True"]
    
    QueuePoolEngine --> SessionFactory["SessionLocal = sessionmaker(bind=engine)"]
    NullPoolEngine --> SessionFactory
    SessionFactory --> FastAPIDep["FastAPI get_db Dependency Injection<br/>(Yields Session, closes in finally block)"]
```

### LangGraph ReAct Agent Execution Loop

The AI agent in `backend/app/agents/agent.py` implements a ReAct (Reasoning + Acting) loop using LangGraph `create_react_agent`:

```mermaid
flowchart TD
    UserPrompt["Incoming User Message<br/>(/api/ai/chat)"] --> QuotaCheck{"Check Daily Quota<br/>AIChat.created_at >= today_start < limit?"}
    
    QuotaCheck -- Exceeded --> ErrQuota["Raise HTTP 429<br/>Quota Reached"]
    QuotaCheck -- Allowed --> ResolveSession["Resolve or Create AIChatSession<br/>(Auto-title to first 36 chars)"]
    
    ResolveSession --> PersistUser["Save User Message to DB<br/>(AIChat role='user')"]
    PersistUser --> BuildTools["Build Role-Aware Tools<br/>get_agent_tools(is_admin, ws_id, user_id)"]
    
    BuildTools --> ReActLoop["LangGraph ReAct Execution Loop<br/>(ChatGoogleGenerativeAI: Gemini 2.5 Flash)"]
    
    subgraph AgentLoop ["Autonomous ReAct Loop"]
        ReActLoop --> ModelDecide{"LLM Step Decision"}
        ModelDecide -- Calls Tool --> ExecTool["Execute Tool Closure<br/>(search_workspace, get_tasks, send_email, etc.)"]
        ExecTool --> ReturnToolObservation["Return Observation to Messages"]
        ReturnToolObservation --> ModelDecide
        ModelDecide -- Final Answer --> GenerateResponse["Generate Response String"]
    end
    
    GenerateResponse --> PersistModel["Save AI Response to DB<br/>(AIChat role='model')"]
    PersistModel --> ClientResponse["Return AIChatOut Payload<br/>(response, tools_used, session_id)"]
```

### RAG Ingestion, Chunking & Semantic Search Flow

```mermaid
flowchart TD
    subgraph Ingestion ["1. Document Ingestion Pipeline"]
        Upload["File Uploaded<br/>(.pdf, .docx, .csv, .xlsx, .txt)"] --> Validate{"Format & Size Check<br/>(<= 10MB)"}
        Validate -- Valid --> Extract["extract_text_from_file()<br/>(pdfplumber, docx, pandas)"]
        Extract --> SaveDoc["Save Document Row to PostgreSQL"]
        SaveDoc --> Chunk["chunk_text()<br/>• chunk_size = 1000 words<br/>• overlap = 50 words"]
        Chunk --> DeleteOld["Delete Old Embeddings for Document<br/>supabase.table('embeddings').delete()"]
        DeleteOld --> LoopChunk["For each chunk:"]
        LoopChunk --> CallEmbed["Google GenAI Client<br/>model='gemini-embedding-2-preview'<br/>task_type='RETRIEVAL_DOCUMENT'<br/>dim=768"]
        CallEmbed --> InsertBatch["Batch Insert into embeddings Table<br/>(workspace_id, source_id, embedding, content)"]
    end

    subgraph QueryPipeline ["2. Query Retrieval Pipeline"]
        AgentQuery["search_workspace(query) Tool Invoked"] --> EmbedQuery["Google GenAI Client<br/>model='gemini-embedding-2-preview'<br/>task_type='RETRIEVAL_QUERY'<br/>dim=768"]
        EmbedQuery --> RPC["Supabase RPC Call<br/>match_embeddings(query_embedding, ws_id, count=5)"]
        RPC --> CosineMatch["pgvector Cosine Search<br/>1 - (embedding <=> query_embedding)<br/>ORDER BY embedding <=> query_embedding LIMIT 5"]
        CosineMatch --> ReturnContext["Concatenate Chunks as Tool Observation"]
    end
```

### GitHub App Webhook Ingestion & Task Correlation Flow

```mermaid
sequenceDiagram
    autonumber
    participant GitHub as GitHub Servers
    participant Gateway as Webhook Gateway (/api/webhooks/github)
    participant Bg as FastAPI BackgroundTasks
    participant Worker as process_webhook_event()
    participant Matcher as match_pr_to_tasks()
    participant DB as PostgreSQL Relational Store

    GitHub->>Gateway: POST /api/webhooks/github (Headers: X-Hub-Signature-256, X-GitHub-Delivery)
    Gateway->>Gateway: verify_webhook_signature(body, secret) HMAC-SHA256
    alt Invalid Signature
        Gateway-->>GitHub: HTTP 401 Invalid Signature
    else Valid Signature
        Gateway->>DB: Check delivery_id idempotency
        alt Delivery ID Already Exists
            Gateway-->>GitHub: HTTP 202 {"status": "already_received"}
        else New Event
            Gateway->>DB: Insert GitHubEvent (status="pending")
            Gateway->>Bg: Enqueue process_webhook_event(event_id)
            Gateway-->>GitHub: HTTP 202 {"status": "accepted"}
            
            Bg->>Worker: Execute in worker thread
            alt Push Event
                Worker->>DB: Parse commits, insert GitHubCommit rows
            else Pull Request Event
                Worker->>DB: Upsert GitHubPullRequest row
                Worker->>Matcher: match_pr_to_tasks(pr, workspace_id)
                Matcher->>DB: Query open tasks (todo, in_progress)
                Matcher->>Matcher: Calculate keyword overlap & branch signal
                opt Match Score >= 0.4
                    Matcher->>DB: Insert TaskGitHubLink (status="suggested")
                end
            else Installation Event
                Worker->>DB: Record InstallationLifecycleEvent, update status
            end
            Worker->>DB: Update GitHubEvent status="processed"
        end
    end
```

### Supabase Realtime Messaging Flow

```mermaid
sequenceDiagram
    autonumber
    actor Alice as Sender (Browser)
    participant API as FastAPI Backend (/api/chat)
    participant SupaDB as Supabase Database (messages table)
    participant RT as Supabase Realtime Engine
    actor Bob as Recipient (Browser)

    Alice->>API: POST /api/chat/{ws_id}/messages {content, recipient_id}
    API->>API: Verify membership & verify settings_allow_dm
    API->>SupaDB: INSERT into messages (sender_id, recipient_id, content)
    SupaDB-->>API: Return inserted message row
    API-->>Alice: HTTP 201 Created (MessageOut)
    
    SupaDB->>RT: Postgres Change Data Capture (WAL INSERT)
    RT->>Bob: WebSocket Broadcast: postgres_changes on messages table
    Bob->>Bob: Inspect payload: is_dm? recipient_id == current_user.id?
    alt Message is for Current Conversation
        Bob->>Bob: Append to chatMessages state (reconcile optimistic ID)
    else Message is for Another Conversation
        Bob->>Bob: Increment unread badge counter in sidebar
    end
```

---

## 6. Repository Structure

```
NexusAI/
├── .gitignore                          # Root Git ignore rules
├── docker-compose.yml                  # Local development orchestration (Postgres, Redis, API, Web)
├── LICENSE                             # MIT Open Source License
├── README.md                           # Comprehensive technical system documentation
│
├── backend/                            # FastAPI Python Backend Application
│   ├── Dockerfile                      # Python 3.11-slim container definition
│   ├── requirements.txt                # Pinned production Python dependencies
│   ├── .env.local / .env               # Environment variable files (git-ignored)
│   ├── app/
│   │   ├── main.py                     # Application factory, middlewares, routers, error handlers
│   │   ├── database.py                 # SQLAlchemy engine, QueuePool/NullPool logic, SessionLocal
│   │   ├── dependencies.py             # Cookie-based JWT authentication dependency
│   │   ├── models.py                   # 21 SQLAlchemy declarative ORM models
│   │   ├── schemas.py                  # Pydantic v2 validation models & request/response schemas
│   │   ├── benchmark_cache.py          # Standalone cold vs. warm Redis cache benchmarking suite
│   │   ├── benchmark_ai_chat.py        # Latency measurement script for RAG + Gemini inference
│   │   ├── locustfile.py               # Locust load-testing script (concurrent authenticated users)
│   │   │
│   │   ├── agents/                     # LangGraph Agentic Implementation
│   │   │   ├── agent.py                # ReAct agent loop, dynamic tool bindings, prompt security
│   │   │   ├── tools.py                # Tools: search_workspace, get_tasks, SMTP emailers
│   │   │   └── state.py                # Agent state definition
│   │   │
│   │   ├── rag/                        # Retrieval-Augmented Generation Components
│   │   │   ├── chunker.py              # 1000-word sliding-window text chunker (50-word overlap)
│   │   │   ├── embedder.py             # Google GenAI gemini-embedding-2-preview client (768-dim)
│   │   │   └── vector_store.py         # pgvector store & cosine similarity search wrapper
│   │   │
│   │   ├── routes/                     # FastAPI Route Domain Handlers
│   │   │   ├── auth.py                 # Argon2 auth, JWT cookies, GitHub OAuth redirect
│   │   │   ├── workspaces.py           # Workspace CRUD, invites, settings, Redis activity feed
│   │   │   ├── documents.py            # Document CRUD, multipart file uploads, RAG triggers
│   │   │   ├── tasks.py                # Kanban task mutations, multi-assignees, email dispatch
│   │   │   ├── chat.py                 # Supabase chat message CRUD & DM isolation
│   │   │   ├── ai.py                   # Agent execution endpoint, session management, quotas
│   │   │   ├── github.py               # GitHub App integration, HMAC webhooks, PR-task matcher
│   │   │   └── flows.py                # Nexus Flow canvas graph sync, snapshots, Gemini explainer
│   │   │
│   │   ├── services/                   # External API & Cryptography Services
│   │   │   └── github_app.py           # RS256 JWT generator, installation token cache, HMAC check
│   │   │
│   │   └── utils/                      # Shared Utility Modules
│   │       ├── document_parser.py      # Extract text/tables from PDF, DOCX, CSV, Excel
│   │       ├── development_cache.py    # SHA-256 fingerprint caching for LLM summaries
│   │       ├── redis_client.py         # Redis connection pool & client singleton
│   │       ├── supabase_client.py      # Supabase client singleton
│   │       └── gemini_client.py        # Gemini client initialization
│
└── frontend/                           # Next.js 14 TypeScript Web Client
    ├── Dockerfile                      # Multi-stage production build (standalone runner)
    ├── package.json                    # Dependencies & build scripts
    ├── next.config.mjs                 # Next.js configuration (output: "standalone")
    ├── tailwind.config.ts              # Tailwind CSS palette tokens & animation keyframes
    ├── tsconfig.json                   # Strict TypeScript compiler options
    │
    ├── app/                            # Next.js 14 App Router Directory
    │   ├── layout.tsx                  # Root HTML wrapper, font declarations, providers
    │   ├── providers.tsx               # TanStack Query Client Provider
    │   ├── globals.css                 # Design system CSS tokens, typography, custom scrollbars
    │   ├── page.tsx                    # Public landing page with feature walkthrough
    │   │
    │   ├── (auth)/                     # Unauthenticated Route Group
    │   │   ├── login/page.tsx          # Login form with email/password and GitHub OAuth button
    │   │   └── register/page.tsx       # Registration form with client-side password validation
    │   │
    │   └── (app)/                      # Authenticated Application Route Group
    │       └── dashboard/
    │           ├── layout.tsx          # Dashboard layout (sidebar, workspace switcher, nav)
    │           ├── page.tsx            # Main executive dashboard (activity feed, digest, stats)
    │           ├── flows/              # Nexus Flow canvas index & interactive editor
    │           │   ├── page.tsx        # Workflow template chooser & flow list
    │           │   └── [id]/page.tsx   # React Flow canvas, node types, snapshots, AI explain
    │           ├── documents/          # Document management
    │           │   ├── page.tsx        # Document listing & upload dropzone
    │           │   └── [id]/page.tsx   # Document editor route wrapper
    │           ├── chat/page.tsx       # Real-time chat & strict-privacy DMs
    │           ├── tasks/page.tsx      # Interactive Kanban board with drag-and-drop
    │           ├── ai/page.tsx         # Agentic AI assistant with persistent sessions
    │           ├── integrations/page.tsx# GitHub App management, commit streams, PR lists
    │           └── settings/page.tsx   # Admin settings (quotas, DMs, uploads, member roles)
    │
    ├── components/                     # Reusable UI & App Components
    │   ├── app/
    │   │   ├── Avatar.tsx              # Deterministic user avatar with color generation
    │   │   ├── DocumentEditor.tsx      # TipTap rich text editor with autosave timer
    │   │   ├── EmptyState.tsx          # Empty state placeholder component
    │   │   ├── LoadingScreen.tsx       # Skeleton loading views for dashboard modules
    │   │   └── Spinner.tsx             # Animated SVG spinner
    │   └── ui/                         # Base design primitives
    │
    ├── lib/                            # Shared Client Libraries
    │   ├── api.ts                      # Axios instance with 401 token refresh interceptor
    │   ├── supabase.ts                 # Supabase client for client-side Realtime subscriptions
    │   └── utils.ts                    # Date formatting, class merging (cn) helpers
    │
    ├── store/                          # Zustand Persistent Stores
    │   ├── authStore.ts                # User profile state & logout handler
    │   ├── workspaceStore.ts           # Active workspace state & list
    │   └── themeStore.ts               # Dark/Light theme mode state
    │
    └── types/                          # TypeScript Interfaces & Contract Models
        └── index.ts                    # Workspace, Task, Document, Flow, GitHub types
```

---

## 7. Frontend Architecture

### Core Architecture & State Management
- **Next.js 14 App Router**: Layout-driven routing where `(app)/dashboard/layout.tsx` wraps all authenticated views.
- **Zustand Persistent State**:
  - `authStore.ts`: Persisted in `localStorage` under `nexus-auth`. Tracks authenticated `User` profile. The `logout()` method posts to `/api/auth/logout`, purges `localStorage`, clears workspace state, and sets user to null.
  - `workspaceStore.ts`: Persisted under `nexus-workspace`. Maintains `currentWorkspace` and workspace collections.
  - `themeStore.ts`: Manages theme preferences (`dark`/`light`).
- **Elimination of Loading Waterfalls**: `dashboard/layout.tsx` fetches user identity and workspace collections concurrently via `Promise.all([api.get("/auth/me"), api.get("/workspaces/")])`.
- **Axios Interceptor & Seamless Session Renewal**: `frontend/lib/api.ts` intercepts incoming HTTP `401 Unauthorized` responses. If a request fails authentication, it holds the original request, dispatches a single call to `POST /api/auth/refresh`, and retries the original request upon receipt of fresh cookies. If refresh fails, it redirects the browser to `/login`.

---

## 8. Backend Architecture

### Application Initialization & Middleware Order
The backend initializes in `backend/app/main.py`:
1. **Schema Initialization**: Executes `Base.metadata.create_all(bind=engine)` inside a try-except block to safely provision relational tables upon startup.
2. **Rate Limiting**: Initializes `slowapi.Limiter` with `get_remote_address` and attaches `_rate_limit_exceeded_handler` for `RateLimitExceeded` exceptions.
3. **CORS Middleware**: `CORSMiddleware` configured with `allow_credentials=True`, allowing specific origins (`http://localhost:3000`, `http://localhost:8080`, `https://nexus-avadhesh.vercel.app`, and `os.getenv("FRONTED_URL")`).
4. **Router Registration**: Mounts domain routers under the `/api` prefix:
   - `auth.router`, `workspaces.router`, `documents.router`, `chat.router`, `tasks.router`, `ai.router`, `github.router`, `flows.router`.
5. **Global Exception Handling**:
   - `StarletteHTTPException`: Standardizes error payloads to `{"detail": exc.detail}`.
   - `Exception`: Catches unhandled internal crashes, logs stack traces, and returns `HTTP 500 {"detail": "Internal server error"}`.

---

## 9. Complete API Reference

Every endpoint documented below is verified against actual route definitions in `backend/app/routes/`.

### System Health

#### `GET /api/health`
- **Purpose**: Liveness and operational health probe.
- **Authentication**: None (exempt from rate limits).
- **Success Response (200 OK)**:
  ```json
  {
    "status": "ok",
    "services": {
      "api": "operational",
      "database": "operational",
      "agent_engine": "operational"
    }
  }
  ```

---

### Authentication Routes

#### `POST /api/auth/register`
- **Purpose**: Creates a new user account.
- **Authentication**: Public (Rate-limited to 3 requests/minute).
- **Validation**: Passwords must be at least 8 characters long, contain an uppercase letter, and contain a digit.
- **Request Body**:
  ```json
  {
    "email": "engineer@nexusai.dev",
    "password": "Password123!"
  }
  ```
- **Side Effects**: Hashes password using Argon2. Issues and sets HttpOnly `access_token` and `refresh_token` cookies.
- **Success Response (200 OK)**:
  ```json
  {
    "message": "Registered successfully"
  }
  ```
- **Error Responses**: `400 Bad Request` if email already registered.

#### `POST /api/auth/login`
- **Purpose**: Authenticates credentials and establishes session cookies.
- **Authentication**: Public (Rate-limited to 5 requests/minute).
- **Request Body**:
  ```json
  {
    "email": "engineer@nexusai.dev",
    "password": "Password123!"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "message": "Login successful"
  }
  ```
- **Error Responses**: `401 Unauthorized` for invalid credentials.

#### `POST /api/auth/refresh`
- **Purpose**: Rotates JWT access and refresh tokens.
- **Authentication**: Requires valid `refresh_token` cookie (Rate-limited to 10 requests/minute).
- **Success Response (200 OK)**:
  ```json
  {
    "message": "Token refreshed"
  }
  ```

#### `POST /api/auth/logout`
- **Purpose**: Terminates user session.
- **Authentication**: Requires `refresh_token` cookie.
- **Side Effects**: Sets `Max-Age=0` on `access_token` and `refresh_token` cookies.
- **Success Response (200 OK)**:
  ```json
  {
    "message": "Logged out"
  }
  ```

#### `GET /api/auth/me`
- **Purpose**: Retrieves the authenticated user profile.
- **Authentication**: Requires valid `access_token` cookie.
- **Success Response (200 OK)**:
  ```json
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "engineer@nexusai.dev"
  }
  ```

#### `GET /api/auth/github`
- **Purpose**: Initiates GitHub OAuth authentication.
- **Success Response (307/302 Redirect)**: Redirects browser to `https://github.com/login/oauth/authorize`.

#### `GET /api/auth/github/callback`
- **Purpose**: Handles OAuth code exchange from GitHub.
- **Query Parameters**: `code` (string).
- **Success Response (302 Redirect)**: Exchanges token, creates/finds user in database, sets auth cookies, and redirects browser to `/dashboard`.

---

### Workspace Management Routes

#### `POST /api/workspaces/`
- **Purpose**: Provisions a new isolated workspace.
- **Authentication**: Required.
- **Request Body**:
  ```json
  {
    "name": "Core Platform Engineering",
    "description": "Primary repository & infrastructure management"
  }
  ```
- **Side Effects**: Sets creator as `owner_id`, assigns `admin` role in `workspace_members`, and generates a 7-day invite code.
- **Success Response (201 Created)**:
  ```json
  {
    "id": "8a32a68c-7f5b-4c07-b31a-637bc92cebfa",
    "name": "Core Platform Engineering",
    "description": "Primary repository & infrastructure management",
    "invite_code": "k9xL2q1P",
    "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "settings_allow_dm": true,
    "settings_ai_daily_limit": 50,
    "settings_allow_file_uploads": true,
    "settings_restrict_invites": false,
    "created_at": "2026-10-14T10:00:00Z",
    "members": []
  }
  ```

#### `GET /api/workspaces/`
- **Purpose**: Lists all workspaces the authenticated user belongs to.
- **Authentication**: Required.
- **Success Response (200 OK)**: Array of `WorkspaceOut` objects.

#### `GET /api/workspaces/{workspace_id}`
- **Purpose**: Fetches single workspace details.
- **Permissions**: User must be a member of the workspace.

#### `DELETE /api/workspaces/{workspace_id}`
- **Purpose**: Deletes workspace and associated metadata.
- **Permissions**: Workspace owner only (`HTTP 403` if called by regular members).
- **Success Response (204 No Content)**.

#### `POST /api/workspaces/join/{invite_code}`
- **Purpose**: Joins an existing workspace via invite code.
- **Authentication**: Required.
- **Error Responses**: `404 Not Found` (invalid code), `410 Gone` (expired code), `400 Bad Request` (already a member).

#### `POST /api/workspaces/{workspace_id}/regenerate-invite`
- **Purpose**: Regenerates workspace invite code with a fresh 7-day expiration.
- **Permissions**: Workspace owner only.

#### `GET /api/workspaces/{workspace_id}/members`
- **Purpose**: Lists workspace members and assigned roles.
- **Permissions**: Workspace members only.

#### `PATCH /api/workspaces/{workspace_id}/members/{member_id}/role`
- **Purpose**: Updates member role.
- **Permissions**: Workspace administrator only.
- **Request Body**: `{"role": "admin" | "member" | "viewer"}`.

#### `DELETE /api/workspaces/{workspace_id}/members/{member_id}`
- **Purpose**: Removes a member from the workspace.
- **Permissions**: Workspace administrator only. Workspace owners cannot be removed (`400 Bad Request`).

#### `GET /api/workspaces/{workspace_id}/settings`
- **Purpose**: Retrieves admin settings, toggles, and daily AI prompt usage.
- **Authentication**: Workspace members.

#### `PATCH /api/workspaces/{workspace_id}/settings`
- **Purpose**: Updates governance settings (DM toggles, daily AI limits, file upload restrictions).
- **Permissions**: Workspace administrator only.

#### `GET /api/workspaces/{workspace_id}/activity`
- **Purpose**: Aggregates workspace activity stream across documents, tasks, members, GitHub commits/PRs, and chat.
- **Performance**: Cached in Redis for 15 seconds (`nexus:ws_activity:{ws_id}:{user_id}`).
- **Privacy Enforcement**: Direct Messages are filtered so users only see channel messages and their own private DMs.

---

### Document Management & Ingestion Routes

#### `POST /api/documents/`
- **Purpose**: Creates an empty or markdown-seeded document.
- **Request Body**: `{"title": "Architecture Overview", "content": "# Architecture", "workspace_id": "UUID"}`.
- **Side Effects**: Automatically generates embeddings and updates pgvector table if content is provided.

#### `POST /api/documents/upload`
- **Purpose**: Ingests uploaded document file into RAG pipeline.
- **Request Type**: `multipart/form-data` with fields `workspace_id: UUID`, `file: UploadFile`.
- **Validation**: Checks `settings_allow_file_uploads`. Enforces 10MB limit and extensions `.pdf`, `.docx`, `.csv`, `.xlsx`, `.xls`, `.txt`, `.md`.
- **Side Effects**: Extracts text and tables, persists document, chunks content into 1000-word windows, embeds vectors via `gemini-embedding-2-preview`, and inserts rows into `embeddings`.

#### `GET /api/documents/?workspace_id={id}`
- **Purpose**: Lists all workspace documents sorted by `updated_at` descending.

#### `GET /api/documents/{doc_id}`
- **Purpose**: Retrieves document content and metadata.

#### `PATCH /api/documents/{doc_id}`
- **Purpose**: Updates document title or content.
- **Side Effects**: Re-chunks content and overwrites embeddings in `embeddings`.

#### `DELETE /api/documents/{doc_id}`
- **Purpose**: Deletes document record.
- **Permissions**: Document creator or workspace admin.

---

### Task Management Routes

#### `POST /api/tasks/`
- **Purpose**: Creates a task with assignees.
- **Permissions**: Workspace administrator only (`HTTP 403` for standard members).
- **Request Body**:
  ```json
  {
    "title": "Migrate Redis Client to Connection Pooling",
    "description": "Implement max_connections cap to avoid cloud connection saturation",
    "priority": "high",
    "workspace_id": "UUID",
    "assigned_to_ids": ["UUID"],
    "due_date": "2026-10-25T18:00:00Z",
    "notify_assignee": true
  }
  ```
- **Side Effects**: Inserts `Task`, populates `TaskAssignee` rows, and optionally sends HTML task assignment emails via SMTP.

#### `GET /api/tasks/?workspace_id={id}&status={status}`
- **Purpose**: Lists tasks with batch-resolved assignee emails.

#### `PATCH /api/tasks/{task_id}`
- **Purpose**: Updates task status (`todo`, `in_progress`, `done`), priority, assignees, or title.
- **Permissions**: Any workspace member.

#### `DELETE /api/tasks/{task_id}`
- **Purpose**: Deletes a task.
- **Permissions**: Task creator or workspace administrator.

---

### Chat & Direct Messaging Routes

#### `POST /api/chat/{workspace_id}/messages`
- **Purpose**: Sends a public channel message or private Direct Message.
- **Request Body**:
  ```json
  {
    "content": "Please review the PR for the auth service.",
    "recipient_id": "UUID (optional; null for channel)"
  }
  ```
- **Enforcement**: Verifies recipient is a workspace member. Checks `settings_allow_dm` if `recipient_id` is specified. Inserts directly into Supabase `messages` table.

#### `GET /api/chat/{workspace_id}/messages`
- **Purpose**: Retrieves message history.
- **Query Parameters**: `recipient_id` (optional), `limit` (default 100).
- **Privacy Filtering**: When `recipient_id` is supplied, filters messages between current user and specified recipient. When omitted, fetches only public channel messages (`recipient_id IS NULL`).

#### `GET /api/chat/{workspace_id}/inbox`
- **Purpose**: Queries chat conversations involving the authenticated user to compute unread notification counts.

---

### Agentic AI Routes

#### `POST /api/ai/chat`
- **Purpose**: Executes the LangGraph ReAct agent.
- **Request Body**:
  ```json
  {
    "message": "What tasks are assigned to me that are high priority?",
    "workspace_id": "UUID",
    "session_id": "UUID (optional)",
    "history": [{"role": "user", "content": "Hello"}]
  }
  ```
- **Execution Flow**: Enforces daily quota limits, resolves/creates persistent `AIChatSession`, records user message in `AIChat`, runs LangGraph agent with dynamically bound role-aware tools, records model response in `AIChat`, and returns output.
- **Success Response (200 OK)**:
  ```json
  {
    "response": "You have 1 high-priority task pending: 'Migrate Redis Client'.",
    "tools_used": ["get_tasks"],
    "role": "model",
    "is_admin": true,
    "session_id": "c1a93822-4819-4f3b-b6d4-8d99c4889c02",
    "session_title": "What tasks are assigned to me..."
  }
  ```

#### `GET /api/ai/{workspace_id}/sessions`
- **Purpose**: Lists AI conversation sessions for the current user with message counts.

#### `POST /api/ai/{workspace_id}/sessions`
- **Purpose**: Creates an explicit named session.

#### `GET /api/ai/{workspace_id}/sessions/{session_id}/messages`
- **Purpose**: Retrieves all historical messages for a session.

#### `PATCH /api/ai/{workspace_id}/sessions/{session_id}`
- **Purpose**: Renames a chat session.

#### `DELETE /api/ai/{workspace_id}/sessions/{session_id}`
- **Purpose**: Deletes a single chat session and associated messages.

#### `DELETE /api/ai/{workspace_id}/history`
- **Purpose**: Clears all AI chat sessions and history for current user in workspace.

---

### GitHub Integration & Webhook Routes

#### `GET /api/integrations/github/install-url`
- **Purpose**: Returns the GitHub App installation URL.

#### `GET /api/integrations/github/status`
- **Purpose**: Checks GitHub App connection state and active repository counts.

#### `POST /api/integrations/github/connect`
- **Purpose**: Binds a GitHub App `installation_id` to a workspace.

#### `GET /api/integrations/github/repositories`
- **Purpose**: Lists monitored repositories in the workspace.

#### `POST /api/integrations/github/repositories/sync`
- **Purpose**: Queries GitHub API via installation access token, updates repositories in database, and prunes inaccessible repositories.

#### `POST /api/integrations/github/repositories/toggle`
- **Purpose**: Enables or disables tracking for a specific repository.
- **Request Body**: `{"repository_id": "UUID", "is_active": true}`.

#### `POST /api/integrations/github/sync-activity`
- **Purpose**: Triggers on-demand commit and pull request fetch across all active repositories.

#### `POST /api/webhooks/github`
- **Purpose**: Webhook gateway ingesting GitHub push, PR, and installation events.
- **Headers**: `X-Hub-Signature-256`, `X-GitHub-Delivery`, `X-GitHub-Event`.
- **Validation**: Cryptographic HMAC-SHA256 signature verification.

#### `GET /api/github/since-last-seen`
- **Purpose**: Generates an executive AI summary of repository developments since the user's previous login.
- **Optimization**: Uses SHA-256 fingerprint caching (`development_cache.py`) to bypass LLM inference if repository state has not changed.

#### `GET /api/tasks/{task_id}/github-links`
- **Purpose**: Lists suggested or accepted PRs/commits linked to a task.

#### `POST /api/tasks/{task_id}/suggestions/{suggestion_id}/accept`
- **Purpose**: Accepts a PR-to-task correlation and optionally marks task as `done`.

#### `POST /api/tasks/{task_id}/suggestions/{suggestion_id}/dismiss`
- **Purpose**: Dismisses a PR suggestion.

---

### Nexus Flow Canvas Routes

#### `GET /api/flows/?workspace_id={id}`
- **Purpose**: Lists workspace flows, respecting `private` vs `workspace` visibility.

#### `POST /api/flows/`
- **Purpose**: Creates a blank flow or populates a pre-configured starter template (`github_pr_triage`, `release_pipeline`, `incident_response`).

#### `GET /api/flows/{flow_id}`
- **Purpose**: Returns full workflow canvas graph, including nodes, edges, comments, and versions.

#### `PUT /api/flows/{flow_id}`
- **Purpose**: Updates flow title, description, or visibility.

#### `DELETE /api/flows/{flow_id}`
- **Purpose**: Deletes workflow canvas (Creator or Admin only).

#### `POST /api/flows/{flow_id}/sync`
- **Purpose**: Transactional bulk persistence of canvas nodes and edges.
- **Request Body**:
  ```json
  {
    "nodes": [
      {
        "node_key": "node-1",
        "type": "trigger",
        "label": "Webhook Received",
        "position_x": 120.0,
        "position_y": 180.0,
        "data_json": {"icon": "Play", "color": "#10B981"},
        "linked_object_type": "task",
        "linked_object_id": "UUID"
      }
    ],
    "edges": [
      {
        "edge_key": "edge-1-2",
        "source_node_key": "node-1",
        "target_node_key": "node-2",
        "label": "Execute Pipeline"
      }
    ]
  }
  ```

#### `POST /api/flows/{flow_id}/comments`
- **Purpose**: Attaches a discussion comment to the canvas or a specific node.

#### `POST /api/flows/{flow_id}/versions`
- **Purpose**: Creates a named point-in-time graph snapshot.

#### `POST /api/flows/{flow_id}/versions/{version_id}/restore`
- **Purpose**: Restores the canvas graph to a previous snapshot state.

#### `POST /api/flows/{flow_id}/ai-explain`
- **Purpose**: Executes Gemini 2.5 Flash to synthesize workflow pathways, decision gates, bottlenecks, and automated SOP guidelines.

---

## 10. Database Schema & Data Integrity

### Entity-Relationship Diagram

```mermaid
erDiagram
    users ||--o{ workspace_members : "holds"
    users ||--o{ workspaces : "owns"
    users ||--o{ documents : "authors"
    users ||--o{ tasks : "creates"
    users ||--o{ task_assignees : "assigned"
    users ||--o{ ai_chat_sessions : "starts"
    users ||--o{ github_connections : "authorizes"
    users ||--o{ flows : "authors"
    users ||--o{ flow_comments : "posts"
    users ||--o{ flow_versions : "snapshots"
    users ||--o| user_activity_states : "tracks"

    workspaces ||--o{ workspace_members : "contains"
    workspaces ||--o{ documents : "owns"
    workspaces ||--o{ tasks : "tracks"
    workspaces ||--o{ ai_chat_sessions : "partitions"
    workspaces ||--o{ github_connections : "links"
    workspaces ||--o{ github_repositories : "monitors"
    workspaces ||--o{ flows : "contains"

    tasks ||--o{ task_assignees : "assigns"
    tasks ||--o{ task_github_links : "correlates"

    ai_chat_sessions ||--o{ ai_chat_history : "groups"

    github_repositories ||--o{ github_pull_requests : "receives"
    github_repositories ||--o{ github_commits : "contains"

    github_pull_requests ||--o{ task_github_links : "matches"
    github_commits ||--o{ task_github_links : "matches"

    flows ||--o{ flow_nodes : "contains"
    flows ||--o{ flow_edges : "contains"
    flows ||--o{ flow_comments : "receives"
    flows ||--o{ flow_versions : "versions"

    users {
        uuid id PK
        string email UK
        string password
        datetime created_at
    }

    workspaces {
        uuid id PK
        string name
        string description
        string invite_code UK
        datetime invite_expires_at
        uuid owner_id FK
        boolean settings_allow_dm
        integer settings_ai_daily_limit
        boolean settings_allow_file_uploads
        boolean settings_restrict_invites
        datetime created_at
    }

    workspace_members {
        uuid id PK
        uuid workspace_id FK
        uuid user_id FK
        enum role
        datetime joined_at
    }

    documents {
        uuid id PK
        string title
        string content
        uuid workspace_id FK
        uuid created_by FK
        datetime created_at
        datetime updated_at
    }

    tasks {
        uuid id PK
        string title
        string description
        enum status
        enum priority
        uuid workspace_id FK
        uuid created_by FK
        uuid assigned_to FK
        datetime due_date
        datetime created_at
        datetime updated_at
    }

    task_assignees {
        uuid id PK
        uuid task_id FK
        uuid user_id FK
        datetime created_at
    }

    ai_chat_sessions {
        uuid id PK
        uuid workspace_id FK
        uuid user_id FK
        string title
        datetime created_at
        datetime updated_at
    }

    ai_chat_history {
        uuid id PK
        uuid workspace_id FK
        uuid user_id FK
        uuid session_id FK
        string role
        string message
        datetime created_at
    }

    flows {
        uuid id PK
        uuid workspace_id FK
        string title
        string description
        uuid created_by FK
        string visibility
        datetime created_at
        datetime updated_at
    }

    flow_nodes {
        uuid id PK
        uuid flow_id FK
        string node_key
        string type
        string label
        float position_x
        float position_y
        json data_json
        string linked_object_type
        string linked_object_id
    }

    flow_edges {
        uuid id PK
        uuid flow_id FK
        string edge_key
        string source_node_key
        string target_node_key
        string label
        json data_json
    }
```

### Data Model Reference

1. **`users`**: Root credential store. `password` is nullable to allow GitHub OAuth provisioned accounts without local passwords.
2. **`workspaces`**: Core tenant boundary. Governs settings: `settings_allow_dm`, `settings_ai_daily_limit`, `settings_allow_file_uploads`, and `settings_restrict_invites`.
3. **`workspace_members`**: Membership join table enforcing role enums (`admin`, `member`, `viewer`).
4. **`documents`**: Document storage holding raw text and TipTap serialized HTML/text.
5. **`tasks`**: Work tracker items. Stores primary assignee in `assigned_to` and multi-assignees in `task_assignees`.
6. **`task_assignees`**: Normalized mapping supporting multiple assignees per task with cascade deletion on task removal.
7. **`ai_chat_sessions`**: Chat session groupings with custom or auto-generated session titles.
8. **`ai_chat_history`**: Granular message turns (`user` vs `model`) linked to sessions.
9. **`github_connections`**: Installation tracking linking GitHub App `installation_id` to workspaces.
10. **`github_repositories`**: Repositories synchronized from GitHub installations.
11. **`github_events`**: Audit table storing webhook payloads with unique `delivery_id` constraints.
12. **`github_pull_requests`**: Monitored PRs tracking branch metadata, states, and author logins.
13. **`github_commits`**: Monitored Git commits with SHA hashes, author logins, and additions/deletions.
14. **`task_github_links`**: Suggested or accepted semantic associations between PRs/commits and tasks.
15. **`user_activity_states`**: Tracks user `last_seen_at` and `previous_seen_at` timestamps for digest computation.
16. **`installation_lifecycle_events`**: Audit trail of installation suspensions, deletions, and additions.
17. **`flows`**: Workflow canvas documents with visibility toggles (`workspace`, `private`).
18. **`flow_nodes`**: React Flow canvas nodes with coordinates and object links (`task`, `document`).
19. **`flow_edges`**: Directed connections between node handles.
20. **`flow_comments`**: Asynchronous discussion cards anchored to the canvas or specific nodes.
21. **`flow_versions`**: JSON snapshots storing complete node/edge graphs for rollback.

### Supabase Native Collections & Vector Storage

In addition to SQLAlchemy tables, Nexus AI utilizes two native PostgreSQL tables initialized directly in Supabase:

```sql
-- Embeddings table for Vector RAG
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

-- Cosine index for sub-millisecond retrieval
CREATE INDEX IF NOT EXISTS embeddings_vector_idx ON embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Vector match procedure
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

## 11. AI, RAG & Agent Internals

### Vector Pipeline Specification
- **Embedding Model**: Google GenAI `gemini-embedding-2-preview` called via the official `google-genai` SDK (`from google import genai`).
- **Dimensionality**: Configured for `output_dimensionality = 768`.
- **Task Types**: Uses `task_type = "RETRIEVAL_DOCUMENT"` during document ingestion chunking and `task_type = "RETRIEVAL_QUERY"` during query vectorization.
- **Chunking Algorithm**: `backend/app/rag/chunker.py` executes a sliding word window:
  - Default chunk size: **1,000 words**.
  - Default overlap: **50 words**.
  - Boundary strategy: Words are split on whitespace; if total word count is $\le 1000$, the text is retained as a single chunk. Overlapping words ensure semantic continuity across split boundaries.

### LangGraph ReAct Implementation
- **Agent Architecture**: LangGraph `create_react_agent(model=llm, tools=tools, prompt=system)`.
- **Context Baking via Closures**: Rather than forcing the LLM to guess internal UUIDs or pass authorization parameters, `get_agent_tools()` in `backend/app/agents/agent.py` binds `workspace_id`, `user_id`, and `is_admin` via function closures:
  ```python
  @make_tool
  def search_workspace_tool(query: str) -> str:
      """Search workspace documents and knowledge."""
      return search_workspace.func(query=query, workspace_id=workspace_id)
  ```
- **Prompt Injection Defense**: The agent system prompt strictly forbids role overrides, prohibits execution of instructions attempting to bypass security boundaries, and enforces sanitization against raw HTML/script tags.

---

## 12. Authentication, Authorization & Security

### Security Observations & Verified Implementations
1. **Password Hashing**: State-of-the-art memory-hard Argon2 (`argon2-cffi`) with automatic salt generation, mitigating GPU-based offline dictionary attacks.
2. **Dual-Cookie Token Isolation**:
   - `access_token`: 15-minute lifespan.
   - `refresh_token`: 7-day lifespan.
   - Both cookies set with `HttpOnly=True`. In production mode (`PRODUCTION=True`), cookies are enforced with `Secure=True` and `SameSite="none"`. In development mode, `SameSite="lax"` and `Secure=False` are used.
3. **API Rate Limiting**: SlowAPI token-bucket limiter protects endpoints against brute-force attacks:
   - `/api/auth/register`: 3 req/min.
   - `/api/auth/login`: 5 req/min.
   - `/api/auth/refresh`: 10 req/min.
4. **Cryptographic Webhook Verification**: `backend/app/services/github_app.py` computes an HMAC-SHA256 digest of the raw webhook body using `GITHUB_WEBHOOK_SECRET` and executes constant-time string comparison (`hmac.compare_digest`) against `X-Hub-Signature-256`.
5. **Database-Level DM Partitioning**: Direct messages enforce strict SQL WHERE conditions (`recipient_id == current_user.id OR sender_id == current_user.id`), preventing unauthorized member snooping.

---

## 13. Setup & Local Development

### Prerequisites
- **Node.js**: `v20.x` or higher
- **Python**: `3.11` or `3.12`
- **Docker Desktop**: For running local Postgres 16 and Redis 7 containers
- **Google AI Studio Key**: API Key with Gemini 2.5 Flash and Embeddings enabled
- **Supabase Account**: Project instance for database and real-time chat

### Supabase Schema & Vector Extension Initialization
In your Supabase SQL Editor, run:
```sql
CREATE EXTENSION IF NOT EXISTS vector;

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

CREATE INDEX IF NOT EXISTS embeddings_vector_idx ON embeddings
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    sender_email TEXT NOT NULL,
    recipient_id UUID,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

### Environment Configuration

#### Backend Configuration (`backend/.env`)
```env
DATABASE_URL=postgresql://postgres.your-project:your-password@aws-0-region.pooler.supabase.com:5432/postgres
JWT_SECRET=your-secure-random-jwt-secret-key-32-chars
JWT_ALGORITHM=HS256
PRODUCTION=false
FRONTEND_URL=http://localhost:3000

# Redis Cache
REDIS_URL=redis://localhost:6379/0

# Supabase Client
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-role-key

# Google Gemini & RAG
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash

# Optional LangSmith Tracing
LANGCHAIN_TRACING_V2=false
LANGSMITH_API_KEY=
LANGSMITH_PROJECT=nexus-ai

# GitHub App Integration
GITHUB_APP_ID=your-github-app-id
GITHUB_APP_SLUG=your-app-slug
GITHUB_WEBHOOK_SECRET=your-webhook-secret
GITHUB_APP_PRIVATE_KEY_PATH=nexus-private-key.pem
GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-client-secret

# SMTP Email Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
```

#### Frontend Configuration (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Running via Docker Compose
To run the full stack locally with containerized Postgres, Redis, backend, and frontend:
```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API Docs: `http://localhost:8000/docs`
- Redis: `localhost:6379`
- PostgreSQL: `localhost:5432`

### Running Backend & Frontend Manually

#### Step 1: Start Redis Container
```bash
docker run -d -p 6379:6379 --name nexus-redis redis:7-alpine
```

#### Step 2: Start Backend
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

#### Step 3: Start Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 14. Configuration Reference

| Variable Name | Component | Required? | Purpose & Notes | Safe Placeholder Example |
|---|---|---|---|---|
| `DATABASE_URL` | Backend | **Yes** | PostgreSQL connection URI (auto-selects `QueuePool` vs `NullPool`) | `postgresql://user:pass@host:5432/dbname` |
| `JWT_SECRET` | Backend | **Yes** | Cryptographic secret for signing access & refresh tokens | `replace-with-a-random-32-char-string` |
| `JWT_ALGORITHM` | Backend | No | JWT signing algorithm (defaults to `HS256`) | `HS256` |
| `PRODUCTION` | Backend | No | Flag toggling `Secure` and `SameSite="none"` cookie flags | `false` (local) / `true` (prod) |
| `FRONTEND_URL` | Backend | No | Frontend origin for OAuth redirects and CORS | `http://localhost:3000` |
| `FRONTED_URL` | Backend | No | Fallback CORS origin (noted typo in `main.py`) | `https://nexus.example.com` |
| `REDIS_URL` | Backend | No | Connection string for Redis caching (defaults to `redis://localhost:6379/0`) | `redis://localhost:6379/0` |
| `SUPABASE_URL` | Backend | **Yes** | Supabase project REST & Storage endpoint | `https://xyz.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Backend | **Yes** | Supabase service role key (bypasses RLS for backend tasks) | `eyJhbGciOi...` |
| `GEMINI_API_KEY` | Backend | **Yes** | Google AI Studio key for Gemini 2.5 Flash and Embeddings | `AIzaSy...` |
| `GEMINI_MODEL` | Backend | No | LLM model selector (defaults to `gemini-2.5-flash`) | `gemini-2.5-flash` |
| `GITHUB_APP_ID` | Backend | Optional | GitHub App ID for RS256 JWT creation | `123456` |
| `GITHUB_APP_SLUG` | Backend | Optional | GitHub App slug for installation redirects | `nexus-ai-workspace` |
| `GITHUB_APP_PRIVATE_KEY_PATH` | Backend | Optional | Relative path to GitHub App `.pem` private key | `nexus-private-key.pem` |
| `GITHUB_APP_PRIVATE_KEY` | Backend | Optional | Raw string of RSA private key with `\n` | `-----BEGIN RSA PRIVATE KEY-----...` |
| `GITHUB_WEBHOOK_SECRET` | Backend | Optional | Secret key for validating incoming GitHub webhook HMACs | `webhook-secret-token` |
| `GITHUB_CLIENT_ID` | Backend | Optional | Client ID for GitHub OAuth login | `Iv1.xxxxxxxxxxxx` |
| `GITHUB_CLIENT_SECRET` | Backend | Optional | Client Secret for GitHub OAuth login | `xxxxxxxxxxxxxxxx` |
| `SMTP_HOST` | Backend | Optional | SMTP mailer host (defaults to `smtp.gmail.com`) | `smtp.gmail.com` |
| `SMTP_PORT` | Backend | Optional | SMTP mailer port (defaults to `587`) | `587` |
| `SMTP_USER` | Backend | Optional | SMTP username / email address | `alerts@nexusai.dev` |
| `SMTP_PASS` | Backend | Optional | SMTP application password | `app-specific-password` |
| `NEXT_PUBLIC_API_URL` | Frontend | **Yes** | Backend URL consumed by Axios client | `http://localhost:8000` |
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend | **Yes** | Supabase project URL for Realtime WebSocket client | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend | **Yes** | Supabase public anonymous key | `eyJhbGciOi...` |

---

## 15. Deployment Architecture

### Containerized Production Topology
- **Backend Deployment**: Containerized using `backend/Dockerfile` (`python:3.11-slim`), building system dependencies for `libpq-dev` and `gcc`. The entrypoint binds dynamically to `$PORT` via `sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"`, making it compatible with cloud platforms like Render, Railway, or Fly.io.
- **Frontend Deployment**: Multi-stage build in `frontend/Dockerfile` targeting Node 20 on Alpine Linux. Compiles Next.js with `output: "standalone"` into `.next/standalone`, served by a lightweight Node runner (`CMD ["node", "server.js"]`) or hosted directly on Vercel.
- **Database & Cache**: Production workloads connect to Supabase PostgreSQL over connection pooler ports (enabling `NullPool` to preserve connection quotas) and Upstash or cloud-managed Redis.

---

## 16. Testing, Load Benchmarking & Observability

### Empirical Redis Cache Benchmarks
Cold vs. warm cache characteristics were evaluated using the controlled test script `backend/app/benchmark_cache.py` against the `/api/workspaces/{id}/activity` feed on an identical database dataset:

| Measurement Metric | Cold Cache *(Keys Evicted)* | Warm Cache *(Redis Active)* | Latency Improvement |
|---|---|---|---|
| **$P_{50}$ Median Latency** | **634 ms** | **49 ms** | **92.2% reduction** |
| **$P_{95}$ Latency** | **1,184 ms** | **69 ms** | **94.2% reduction** |
| **Average Latency** | **606 ms** | **50 ms** | **91.7% reduction** |

*Takeaway*: Serving aggregated workspace activity (documents, tasks, members, commits, and chat) from Redis avoids repetitive SQL join overhead and network transport, reducing median latency by over 12x.

### Locust Concurrency & Load Testing
Evaluated via `backend/app/locustfile.py` simulating 300 concurrent authenticated virtual users executing a mixed workload across workspace listings (33%), task boards (22%), documents (22%), and activity feeds (22%):
- **Sustained Load**: ~21 RPS under realistic 1–3 second human think-time intervals.
- **Rate Limit Defense**: Under a 300-user registration burst against the 100 req/min threshold, the first 100 requests were processed with Argon2 password hashing; the remaining 200 excess requests were rejected with `HTTP 429 Too Many Requests`, preventing CPU thread starvation.

### Current Testing Limitations
- **Unit Test Coverage**: Automated test frameworks such as `pytest` or `jest` are **not present** in the current repository.
- **Existing Suites**: Verification currently relies on Locust (`locustfile.py`), cache benchmarks (`benchmark_cache.py`), AI chat benchmarks (`benchmark_ai_chat.py`), and Next.js linting (`npm run lint`).

---

## 17. Error Handling & Troubleshooting Guide

| Issue / Symptom | Root Cause | Verified Resolution |
|---|---|---|
| `DATABASE_URL is not set` crash | Missing `.env` file in `backend/` directory | Create `backend/.env` containing a valid PostgreSQL URI. |
| Login succeeds but `access_token` missing | `PRODUCTION=true` on unencrypted `http://` localhost | Set `PRODUCTION=false` in `backend/.env` so cookies allow `SameSite=lax` without `Secure`. |
| `HTTP 429 Daily AI message quota reached` | Workspace member exceeded `settings_ai_daily_limit` | Have workspace admin update limit in Settings or set to `0` for unlimited prompts. |
| `413 Request Entity Too Large` on upload | Uploaded file exceeds 10 MB (`MAX_FILE_SIZE`) | Compress file or upload documents $\le 10$ MB. |
| `Could not load private key from GITHUB_APP...` | GitHub App PEM file missing or path incorrect | Place your `.pem` file in `backend/` and set `GITHUB_APP_PRIVATE_KEY_PATH=your_key.pem`. |
| Webhook returns `401 Invalid webhook signature` | `GITHUB_WEBHOOK_SECRET` does not match GitHub config | Verify identical secret token in GitHub App settings and `backend/.env`. |
| Realtime chat messages not appearing | Missing table publication in Supabase | Run `ALTER PUBLICATION supabase_realtime ADD TABLE messages;` in Supabase SQL Editor. |

---

## 18. Performance Optimizations & Trade-Offs

1. **QueuePool vs. NullPool Connection Strategy**:
   - *Trade-off*: Persistent connection pools pay a one-time TCP handshake cost and offer high throughput for local benchmarks. However, cloud PostgreSQL tiers (like Supabase free tier) enforce hard connection limits (typically 25-50 max connections).
   - *Implementation*: Dynamic detection in `database.py` assigns `NullPool` to remote hosts to discard idle connections while maintaining `QueuePool` for local runs.
2. **Deterministic SHA-256 Fingerprint Caching**:
   - *Trade-off*: Generating executive AI summaries on every dashboard load burns LLM API credits and adds 1.5–3 seconds of latency.
   - *Implementation*: Hashes the IDs, timestamps, and commit messages of recent development activity. Unchanged activity serves the cached synthesis instantly at $0 cost.
3. **Optimistic UI with Realtime Deduplication**:
   - *Trade-off*: Realtime WebSocket streams can create message stutter or duplicate rendering when receiving an echo of a client's own message.
   - *Implementation*: Messages sent by the user receive temporary `optimistic-*` IDs. When the Supabase WebSocket event arrives, the client reconciles the optimistic placeholder with the real message.

---

## 19. Technical Debt & Future Improvements

### Verified Technical Debt in Source Code
1. **Document Embeddings Cleanup on Deletion**: `DELETE /api/documents/{doc_id}` deletes the `Document` database row, but does not explicitly execute `supabase.table("embeddings").delete().eq("source_id", doc_id)`.
2. **Typo in CORS Environment Variable**: `backend/app/main.py` line 27 reads `os.getenv("FRONTED_URL")` (missing an 'N') alongside hardcoded origins.
3. **Hardcoded Fallback URLs**: SMTP email templates in `backend/app/agents/tools.py` contain hardcoded links to `https://nexus-gamma-drab.vercel.app` rather than resolving `FRONTEND_URL`.
4. **Absence of Unit Tests**: No `pytest` or `jest` suites exist to validate regression boundaries.

### Suggested Improvements
- Implement Redis-backed Celery/RQ workers for asynchronous document chunking and vector storage on uploads over 5 MB.
- Add Operational Transformation (OT) or Yjs CRDTs to Nexus Flow Canvas for multi-user live cursor collaboration.
- Implement automated test pipelines with `pytest` covering auth, RBAC guards, and RAG chunking logic.

---

## 20. Technical Interview Preparation

### 60-Second Elevator Pitch
> *"Nexus AI is an enterprise workspace application built with FastAPI and Next.js 14 that unifies documents, tasks, discussions, visual workflows, and GitHub intelligence into a collaborative ecosystem. Unlike traditional chatbots, Nexus AI embeds AI as an active team member using a LangGraph ReAct agent powered by Gemini 2.5 Flash. The agent dynamically binds role-aware tools—such as vector retrieval over pgvector, task mutations, and SMTP email alerts—based on the user's workspace permissions. The architecture features dual HttpOnly cookie authentication, an HMAC-verified GitHub App webhook gateway, and an interactive React Flow canvas that links nodes to operational tasks and documents with Gemini-powered SOP analysis. Performance is backed by Redis caching that reduces activity feed latency by 92% and deterministic SHA-256 fingerprinting that skips redundant LLM calls."*

### 3-Minute Deep Dive
> *"When designing Nexus AI, the primary architectural challenge was eliminating context fragmentation across software teams without introducing security vulnerabilities or AI hallucinations.*
>
> *On the backend, we built a FastAPI application with SQLAlchemy and PostgreSQL. For security, we implemented Argon2 password hashing and dual HttpOnly JWT cookies (a 15-minute access token and a 7-day refresh token), combined with an Axios interceptor on Next.js that silently renews sessions. Multi-tenancy is enforced at the database level where all entities are scoped to a workspace ID.*
>
> *For our AI layer, we avoided static prompt engineering in favor of a LangGraph ReAct agent. When a user sends a message, the system evaluates their role in the workspace. If they are an administrator, the agent is dynamically provisioned with administrative tools—such as creating tasks or dispatching deadline alert emails. If they are a standard member, those tools are omitted from the agent's graph, and permissions are baked directly into closures so the model cannot hallucinate or elevate privileges. For knowledge retrieval, we built a multimodal RAG pipeline that parses PDFs, Word docs, and spreadsheets, chunks them into 1000-word sliding windows, and stores 768-dimensional vectors in pgvector using Google's gemini-embedding-2-preview model.*
>
> *For engineering intelligence, we built a GitHub App gateway that signs RS256 JWTs to exchange short-lived installation tokens. Incoming webhooks are verified via HMAC-SHA256 signatures and processed asynchronously, correlating PRs to open tasks using semantic keyword overlap and branch naming signals.*
>
> *Finally, to optimize performance and cloud costs, we introduced a two-tier caching strategy. First, high-frequency activity feeds are cached in Redis for 15 seconds, dropping P95 latency from 1,184 ms to 69 ms. Second, we implemented a deterministic development cache that hashes repository activity with SHA-256. If a user revisits the dashboard and no new commits or PRs have landed, the system serves the cached AI synthesis instantly with zero LLM token costs."*

### 10 Core Architecture & Implementation Questions

#### 1. How does the LangGraph ReAct agent prevent privilege escalation when executing tools?
**Answer**: Privilege checks are not left to the LLM's judgment. In `backend/app/agents/agent.py`, the `get_agent_tools()` factory inspects the user's role before constructing the agent graph. If `is_admin` is False, administrative tools (`create_task`, `update_task`, `send_task_reminder_email`, `send_deadline_alert_email`, `send_important_info_email`) are completely excluded from the tool array. Furthermore, workspace context (`workspace_id`, `user_id`) is baked into function closures, preventing the agent or user from passing arbitrary workspace IDs to query or mutate other tenants' data.

#### 2. How are JWTs securely handled between Next.js and FastAPI?
**Answer**: Tokens are never stored in `localStorage` or `sessionStorage`. Upon login or registration, the backend sets two `HttpOnly` cookies: `access_token` (15-minute expiration) and `refresh_token` (7-day expiration). The frontend Axios client uses `withCredentials: true`. When an access token expires, Axios intercepts the `401 Unauthorized` response, issues a single call to `/api/auth/refresh` using the refresh cookie, updates the cookies, and replays the original request transparently.

#### 3. Why did you choose a dual connection pooling strategy in `database.py`?
**Answer**: Serverless cloud PostgreSQL providers (like Supabase free tier) place strict caps on concurrent connections (typically 25–50). Maintaining persistent connection pools across multiple app instances quickly exhausts the connection limit. Therefore, `database.py` detects whether `DATABASE_URL` is pointing to localhost or a remote host: it uses `QueuePool` with 30 warm connections for local load tests, and `NullPool` for cloud deployments to immediately release connections upon request completion.

#### 4. How does the document RAG pipeline handle structured table data in PDFs and Word documents?
**Answer**: In `backend/app/utils/document_parser.py`, PDFs are parsed with `pdfplumber`, which extracts tabular cell matrices and formats them as markdown tables (`| col1 | col2 |`). For DOCX files, `python-docx` iterates through table rows, deduplicating merged cells and formatting rows with pipe delimiters. This ensures that when the sliding-window chunker splits text, tabular row associations remain intact for vector embedding.

#### 5. How does the GitHub webhook gateway guarantee idempotency and security?
**Answer**: Webhook requests are validated cryptographically against `X-Hub-Signature-256` using an HMAC-SHA256 digest of the raw payload bytes. For idempotency, the gateway extracts the `X-GitHub-Delivery` header and queries `github_events.delivery_id`. If an event with that delivery ID already exists, it immediately returns `202 Accepted` with `already_received` without re-processing.

#### 6. How does the "Since You Were Away" AI feature avoid runaway token costs?
**Answer**: In `backend/app/utils/development_cache.py`, the system computes a deterministic SHA-256 hash across the IDs, timestamps, states, and titles of all recent pull requests and commits. If this fingerprint matches the cached entry in Redis, the LLM synthesis is served directly from cache, avoiding redundant Gemini API calls.

#### 7. How is privacy maintained between public channel chat and Direct Messages?
**Answer**: The `messages` table uses a nullable `recipient_id` column. Messages with `recipient_id = NULL` belong to `#general`. When a DM is sent, `recipient_id` is set to the target user. The backend route `/api/chat/{ws_id}/messages` filters messages so users can only access channel messages or DMs where they are either the sender or the recipient.

#### 8. How does Nexus Flow manage graph synchronization and conflict resolution?
**Answer**: The React Flow canvas manages local node and edge states optimistically. When the user saves, the entire graph is transmitted to `POST /api/flows/{flow_id}/sync`. The backend executes a database transaction that clears existing `flow_nodes` and `flow_edges` for that flow and re-inserts the updated topology atomically. Point-in-time graph versions can also be captured as JSON snapshots for rollback.

#### 9. Why does the embedding pipeline use `gemini-embedding-2-preview` with explicit task types?
**Answer**: Embedding quality is asymmetric: documents represent broad informational context, whereas queries represent specific search intent. Google's GenAI embedding API optimizes vector representations by taking a `task_type` parameter. The system uses `RETRIEVAL_DOCUMENT` during ingestion chunking and `RETRIEVAL_QUERY` during similarity search, generating 768-dimensional vectors optimized for cosine similarity.

#### 10. How does the backend prevent Argon2 CPU exhaustion under traffic spikes?
**Answer**: Argon2 is an intentionally memory-hard and CPU-intensive algorithm (~200–500 ms per hash). To prevent attackers from exhausting server CPU threads with registration floods, SlowAPI enforces a strict rate limit of 3 requests per minute on `/api/auth/register` and 5 requests per minute on `/api/auth/login`.

---

### 5 System Design & Trade-Off Questions

#### 1. What are the architectural trade-offs of storing chat messages directly in Supabase vs. an internal PostgreSQL table?
**Answer**: Storing chat messages in Supabase allows the frontend to establish direct WebSocket connections to Supabase Realtime for Change Data Capture (CDC) events on the `messages` table. This eliminated the need to build, scale, and maintain a custom Redis Pub/Sub WebSocket cluster in FastAPI. The trade-off is dual database access: relational data is accessed via SQLAlchemy ORM, while chat and embeddings interact via the Supabase client SDK.

#### 2. If document ingestion scales to thousands of concurrent uploads, where does the architecture bottleneck, and how would you resolve it?
**Answer**: In the current implementation, `POST /api/documents/upload` processes parsing, chunking, and synchronous embedding calls within the request-response thread. Under heavy load, this blocks FastAPI worker threads and risks HTTP timeouts. The production scaling solution is to decouple ingestion: the endpoint immediately saves the file to object storage (e.g. Supabase Storage / S3), inserts a `document` row with status `pending`, and pushes a job ID to a Celery or ARQ Redis queue. Background worker processes handle text extraction and batch vector embedding.

#### 3. How does the sliding-window chunking strategy compare to semantic or recursive chunking?
**Answer**: The implemented sliding window uses 1,000 words with a 50-word overlap. The advantage is predictable chunk size, fast execution without tokenization overhead, and context bridging across chunk edges. The trade-off is that it splits strictly on word counts rather than semantic boundaries (like headings or code blocks). Implementing recursive character or markdown-aware chunking would improve retrieval accuracy for technical documentation containing structured headers and code snippets.

#### 4. How would you handle multi-region database latency for global collaborative workspaces?
**Answer**: Deploying read replicas across regions would allow read-heavy endpoints (workspace listing, documents, task queries, activity feeds) to be served locally. However, since Redis caches activity feeds with a 15-second TTL, read latency is already mitigated. Write operations (task mutations, flow syncs) should route to a primary PostgreSQL instance with transactional consistency.

#### 5. What are the architectural trade-offs of the bulk-replace flow sync (`/api/flows/{id}/sync`)?
**Answer**: The current implementation deletes and re-inserts all nodes and edges for a flow within a database transaction. This ensures consistency and prevents dangling edges without requiring complex delta diffing. However, it is unsuitable for simultaneous real-time multi-user editing, as one user's save will overwrite another's unsaved changes. Transitioning to CRDTs (Conflict-free Replicated Data Types like Yjs) or Operational Transformation would enable collaborative multi-cursor canvas editing.

---

### 5 Failure Scenarios & Debugging Questions

#### 1. If Redis crashes or experiences a network partition, how does the system behave?
**Answer**: The application degrades gracefully without crashing. In `backend/app/utils/redis_client.py`, `get_redis_client()` catches connection exceptions and returns `None`. In `backend/app/utils/development_cache.py`, the cache detects that Redis is unavailable and falls back to an internal in-memory dictionary (`self._memory_fallback`). In `backend/app/routes/workspaces.py`, the activity feed bypasses the cache read and queries PostgreSQL directly.

#### 2. How would you debug an issue where a user reports that the AI agent claims it cannot find a document that was recently uploaded?
**Answer**:
1. Check the `documents` table to verify the document row exists and content was extracted.
2. Check the `embeddings` table for rows where `source_id == doc.id`. If no rows exist, verify if `extract_text_from_file()` failed or returned empty text (e.g. scanned image PDF without OCR).
3. Verify that the `workspace_id` of the document matches the `workspace_id` passed in the AI chat session.
4. Manually execute `match_embeddings` in Supabase SQL editor using the query embedding to verify cosine similarity score thresholds.

#### 3. A user reports that task assignment emails are not being received. How do you triage the issue?
**Answer**:
1. Verify whether `SMTP_USER` and `SMTP_PASS` are configured in `backend/.env`. If missing, `_send_email()` in `backend/app/agents/tools.py` logs a failure and returns `False` without raising an unhandled exception.
2. Verify if the task creation request had `notify_assignee: true`.
3. Check application logs for `Email send failed:` error traces from `smtplib`.
4. If using Gmail SMTP, verify that an App Password was generated rather than a standard account password, and check port 587 TLS connectivity.

#### 4. If GitHub App webhooks suddenly stop updating PRs and commits, what steps do you take?
**Answer**:
1. Check GitHub App settings under **Advanced ➔ Recent Deliveries** to see the HTTP response status codes returned by `/api/webhooks/github`.
2. If responses are `401 Unauthorized`, verify if `GITHUB_WEBHOOK_SECRET` was modified or has trailing whitespace.
3. If responses are `202 Accepted` but rows are not appearing in `github_pull_requests`, inspect the `github_events` table in PostgreSQL. Check the `processing_status` column: if marked `failed`, inspect backend server error logs for exceptions in `process_webhook_event`.
4. Verify that the repository is marked `is_active = true` in `github_repositories`.

#### 5. How would you diagnose an issue where an authenticated user is unexpectedly redirected to `/login` during dashboard navigation?
**Answer**:
1. Open browser DevTools Network tab and inspect the failing request. Check if the response is `401 Unauthorized`.
2. Inspect the subsequent `POST /api/auth/refresh` request. If the refresh request also returns `401`, check if the 7-day `refresh_token` cookie expired or was cleared.
3. Check the cookie headers: in production, verify if `Secure` is enabled on HTTPS. If testing over HTTP with `PRODUCTION=true`, the browser will drop `Secure` cookies.
4. Verify if `JWT_SECRET` in `backend/.env` was restarted with a different key, invalidating all previously issued JWTs.

---

### Key Source Files to Review Before an Interview

1. **`backend/app/agents/agent.py`**: Understand how LangGraph's ReAct loop initializes, how tools are dynamically bound based on admin roles, and how closures encapsulate workspace authorization.
2. **`backend/app/agents/tools.py`**: Review the 8 agent tools, including vector search, task queries, task creation, and SMTP emailers.
3. **`backend/app/rag/embedder.py` & `vector_store.py`**: Understand the Gemini embedding calls, 768-dimension configuration, and `match_embeddings` pgvector stored procedure.
4. **`backend/app/routes/auth.py` & `dependencies.py`**: Understand Argon2 hashing, dual cookie management, and JWT validation.
5. **`backend/app/database.py`**: Understand the dynamic switching between `QueuePool` and `NullPool`.
6. **`backend/app/routes/github.py` & `services/github_app.py`**: Understand RS256 JWT creation, webhook signature verification, and PR-to-task correlation heuristics.
7. **`backend/app/utils/development_cache.py`**: Understand the SHA-256 fingerprint caching mechanism that bypasses redundant LLM inference.
8. **`frontend/lib/api.ts`**: Understand the Axios 401 response interceptor and token rotation retry mechanism.
9. **`frontend/app/(app)/dashboard/flows/[id]/page.tsx`**: Understand how `@xyflow/react` manages canvas state, custom node types, version snapshots, and Gemini SOP generation.

---

## 21. Glossary & References

- **ReAct (Reasoning + Acting)**: An agentic design pattern where the language model interleaves reasoning steps with tool execution actions to solve multi-step problems.
- **pgvector**: An open-source vector similarity search extension for PostgreSQL supporting exact and approximate nearest neighbor searches.
- **IVFFlat**: Inverted File Flat index that partitions vector space into Voronoi cells to accelerate approximate nearest neighbor cosine searches.
- **Argon2**: The password-hashing function winner of the Password Hashing Competition (PHC), providing tunable memory-hardness against ASIC/GPU attacks.
- **HMAC-SHA256**: Hash-based Message Authentication Code utilizing SHA-256 to verify data integrity and authenticity of incoming webhooks.
- **Change Data Capture (CDC)**: A software pattern that monitors and captures database inserts/updates and streams them in real time over WebSockets.

---

<div align="center">
  <sub>Nexus AI Architecture & System Documentation • Maintained by Engineering Team</sub>
</div>
