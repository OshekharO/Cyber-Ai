# Cyber AI 🛡️

An AI-powered cybersecurity assistant chatbot built with React + TypeScript + Vite.

## Features

- 💬 Real-time chat with Cyber AI — a cybersecurity-focused AI assistant
- 🎨 Dark cybersecurity-themed UI with animated elements
- ⌨️ Auto-resizing textarea (Enter to send, Shift+Enter for new line)
- 💡 Quick-start suggestion chips on the welcome screen
- 🔄 Full conversation history sent with each request
- ⚠️ Graceful error handling

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — fast build tool
- Custom CSS — no UI framework dependency

## API

Powered by `https://ai-sqcn.onrender.com/api/chat`

```
POST /api/chat
Content-Type: application/json
Accept: application/json
X-Client: Cyber-AI-Frontend

Body: { "messages": [ { "role": "system" | "user" | "assistant", "content": "..." } ] }
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Supabase Setup

This project now uses Supabase for login, registration, and the admin dashboard.

Set these environment variables locally and in Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Database schema and RLS notes are in [supabase/schema.sql](supabase/schema.sql).

The Vercel rewrite excludes `/api/*`, so the admin users function at [api/admin/users.ts](api/admin/users.ts) stays reachable.

## Build

```bash
npm run build
npm run preview
```
