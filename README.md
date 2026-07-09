# Cyber AI 🛡️

An AI-powered cybersecurity assistant chatbot built with React + TypeScript + Vite.

## Features

- 💬 Real-time chat with Cyber AI — a cybersecurity-focused AI assistant
- 🎨 Dark cybersecurity-themed UI with animated elements
- ⌨️ Auto-resizing textarea (Enter to send, Shift+Enter for new line)
- 💡 Quick-start suggestion chips on the welcome screen
- 🔄 Full conversation history sent with each request
- ⚠️ Graceful error handling
- 🔐 Authentication & authorization with Supabase
- 👑 Admin panel for managing users and sessions
- 📱 Fully responsive design for all screen sizes
- 📤 Export conversations as Markdown
- ⚡ Fast loading with Vite

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — fast build tool
- [Supabase](https://supabase.com/) — authentication & database
- [React Icons](https://react-icons.github.io/react-icons/) — icon library
- Custom CSS — no UI framework dependency

## Architecture

The application is organized into several key components:

### Core Components
- **AuthScreen** — Login and registration interface
- **ChatWorkspace** — Main chat interface with sidebar
- **Header** — Navigation bar with theme toggle and actions
- **Sidebar** — Session management with user profile
- **WelcomeScreen** — Initial onboarding with suggestion chips
- **MessageList** — Chat message display with feedback
- **InputBar** — Message input with auto-resize
- **CommandPalette** — Quick action commands
- **MessageSearch** — Search through conversation history

### Backend Integration
- **Supabase** — User authentication, profiles, and admin management
- **Cyber AI API** — AI-powered cybersecurity assistance
- **Local Storage** — Persistent sessions and theme preferences

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Supabase Setup

This project uses Supabase for authentication and admin functionality.

Set these environment variables locally and in Vercel:

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_SITE_URL` - Your site URL (optional)
- `SUPABASE_URL` - Supabase service role URL (for server-side operations)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

Database schema and RLS policies are in [supabase/schema.sql](supabase/schema.sql).

## Build

```bash
npm run build
npm run preview
```

## Development Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- `npm run lint` — Run ESLint

## Features Details

### Authentication
- Email/password sign-in and sign-up
- Password confirmation and validation
- Secure session management
- Admin user detection and access control

### Chat Interface
- Real-time streaming responses
- Conversation history persistence
- Session management (new, switch, delete)
- Message feedback (up/down votes)

### User Experience
- Persistent theme preference (saved in localStorage)
- Responsive design for desktop and mobile
- Accessibility with proper ARIA labels
- Smooth animations and transitions
- Keyboard shortcuts support

### Admin Features
- User management
- Session monitoring
- Analytics and insights
- Security controls

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome for Android)

## License

This project is part of the Cyber AI initiative for cybersecurity education and assistance.
