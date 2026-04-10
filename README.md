# Cyber AI 🛡️

An AI-powered cybersecurity assistant chatbot built with React + TypeScript + Vite.

## Features

- 💬 Real-time chat with Cyber AI — a cybersecurity-focused AI assistant
- 🎨 Dark cybersecurity-themed UI with animated elements
- ⌨️ Auto-resizing textarea (Enter to send, Shift+Enter for new line)
- 🧭 Expandable topic categories with guided starter prompts
- 📝 Rich Markdown rendering for AI replies (lists, emphasis, code blocks)
- 📋 Per-code-block "Copy code" action
- 📶 Live connection status (online/slow/offline) based on API outcomes
- 🔁 Inline retry button for failed requests without retyping
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

## Build

```bash
npm run build
npm run preview
```
