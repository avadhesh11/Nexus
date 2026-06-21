# Nexus AI — Frontend

## Setup

1. Install dependencies
```bash
npm install
```

2. Fill in your env variables in `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run dev server
```bash
npm run dev
```

Open http://localhost:3000

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS v3
- Zustand (auth + workspace state)
- TanStack Query (server state)
- Axios (HTTP client)
- Supabase JS (realtime chat)
- TipTap (document editor)

## Pages
- `/` — Landing page
- `/login` — Sign in
- `/register` — Create account
- `/dashboard/documents` — Document list
- `/dashboard/documents/[id]` — Document editor
- `/dashboard/chat` — Realtime team chat
- `/dashboard/tasks` — Kanban task board
- `/dashboard/ai` — Agentic AI workspace assistant
