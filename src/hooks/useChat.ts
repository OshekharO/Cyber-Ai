import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { streamChat } from '../api/chat.ts';
import type { ChatMessage, ChatError } from '../api/chat.ts';
import { logUserQuery, type QueryStatus } from '../lib/queries.ts';


// ── Types ────────────────────────────────────────────────────────────────────

export interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  feedback?: 'up' | 'down' | null;
}

export interface Session {
  id: string;
  name: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'cyber-ai-v2';
const THEME_KEY = 'cyber-ai-theme';

// ── Persistence helpers ───────────────────────────────────────────────────────

function createSession(name = 'New Chat'): Session {
  const now = new Date().toISOString();
  return { id: crypto.randomUUID(), name, messages: [], createdAt: now, updatedAt: now };
}

function loadSessions(storageKey: string): Session[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    return JSON.parse(raw) as Session[];
  } catch {
    return [];
  }
}

function saveSessions(storageKey: string, sessions: Session[]): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(sessions));
  } catch {
    // Storage quota exceeded — silently ignore
  }
}

function loadTheme(): 'dark' | 'light' {
  return (localStorage.getItem(THEME_KEY) as 'dark' | 'light' | null) ?? 'dark';
}

function computeMaxId(sessions: Session[]): number {
  let max = 0;
  for (const s of sessions) {
    for (const m of s.messages) {
      if (m.id > max) max = m.id;
    }
  }
  return max;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useChat(storageScope = 'global', sessionToken?: string) {
  const storageKey = `${STORAGE_KEY}:${storageScope}`;

  // Compute initial sessions + activeSessionId together so they always agree.
  // Using a ref ensures the computation runs exactly once even in Strict Mode.
  const initRef = useRef<{ sessions: Session[]; activeSessionId: string } | null>(null);
  if (initRef.current === null) {
    const stored = loadSessions(storageKey);
    if (stored.length > 0) {
      initRef.current = { sessions: stored, activeSessionId: stored[0].id };
    } else {
      const fresh = createSession();
      initRef.current = { sessions: [fresh], activeSessionId: fresh.id };
    }
  }

  // -- State
  const [sessions, setSessions] = useState<Session[]>(initRef.current.sessions);
  const [activeSessionId, setActiveSessionId] = useState<string>(initRef.current.activeSessionId);
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<ChatError | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(loadTheme);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // -- Refs
  const abortRef = useRef<AbortController | null>(null);
  // Seed nextId from the initial sessions data so IDs never collide with persisted ones
  const nextId = useRef(computeMaxId(initRef.current.sessions) + 1);
  // Stable ref to latest messages so callbacks don't need `messages` in their dep arrays
  const messagesRef = useRef<Message[]>([]);

  // Persist sessions whenever they change
  useEffect(() => {
    saveSessions(storageKey, sessions);
  }, [sessions, storageKey]);

  // Apply theme to <html> element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // -- Derived
  const activeSession = useMemo(
    () => sessions.find(s => s.id === activeSessionId) ?? sessions[0],
    [sessions, activeSessionId],
  );
  const messages = useMemo(() => activeSession?.messages ?? [], [activeSession]);
  messagesRef.current = messages;

  // -- Session actions

  const newSession = useCallback(() => {
    const s = createSession();
    setSessions(prev => [s, ...prev]);
    setActiveSessionId(s.id);
    setError(null);
    setStreamingContent('');
  }, []);

  const switchSession = useCallback((id: string) => {
    setActiveSessionId(id);
    setError(null);
    setStreamingContent('');
    setSidebarOpen(false);
  }, []);

  const renameSession = useCallback((id: string, name: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, name: name.trim() || 'New Chat' } : s));
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      if (next.length === 0) {
        const fresh = createSession();
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (id === activeSessionId) {
        setActiveSessionId(next[0].id);
      }
      return next;
    });
  }, [activeSessionId]);

  const clearMessages = useCallback(() => {
    setSessions(prev => prev.map(s =>
      s.id === activeSessionId ? { ...s, messages: [], updatedAt: new Date().toISOString() } : s
    ));
    setError(null);
  }, [activeSessionId]);

  // -- Message actions

  const updateMessages = useCallback((updater: (msgs: Message[]) => Message[]) => {
    setSessions(prev => prev.map(s =>
      s.id === activeSessionId
        ? { ...s, messages: updater(s.messages), updatedAt: new Date().toISOString() }
        : s
    ));
  }, [activeSessionId]);

  const setFeedback = useCallback((msgId: number, fb: 'up' | 'down') => {
    updateMessages(msgs =>
      msgs.map(m => m.id === msgId ? { ...m, feedback: m.feedback === fb ? null : fb } : m)
    );
  }, [updateMessages]);

  // -- Send / Stream

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError(null);
    const userMsg: Message = {
      id: nextId.current++,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    // Auto-name session from first message
    setSessions(prev => prev.map(s => {
      if (s.id !== activeSessionId) return s;
      const isFirst = s.messages.length === 0;
      const name = isFirst ? trimmed.slice(0, 40) + (trimmed.length > 40 ? '…' : '') : s.name;
      return { ...s, name, messages: [...s.messages, userMsg], updatedAt: new Date().toISOString() };
    }));

    setLoading(true);
    setStreamingContent('');

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    // Build API messages from updated session (read from ref for stable callback identity)
    const history = [...messagesRef.current, userMsg];
    const apiMessages: ChatMessage[] = history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    let accumulated = '';
    try {
      const result = await streamChat(
        apiMessages,
        (token) => {
          accumulated += token;
          setStreamingContent(accumulated);
        },
        ctrl.signal,
      );

      // Commit the streamed reply as a full message
      if (accumulated) {
        const aiMsg: Message = {
          id: nextId.current++,
          role: 'assistant',
          content: accumulated,
          timestamp: new Date().toISOString(),
        };
        setSessions(prev => prev.map(s =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, aiMsg], updatedAt: new Date().toISOString() }
            : s
        ));
      }

      // Record the query so admins can see what users asked for.
      void logUserQuery({
        query: trimmed,
        source: result.source,
        status: 'success',
        userId: storageScope !== 'guest' ? storageScope : null,
        sessionId: activeSessionId,
        accessToken: sessionToken,
      });
    } catch (err: unknown) {
      const chatErr = err as ChatError;
      // Don't show error for user-initiated cancellation
      if (chatErr.kind !== 'unknown' || chatErr.message !== 'Request cancelled.') {
        setError(chatErr);
      }

      // Record failed queries too (cancelled vs errored).
      const status: QueryStatus = chatErr.kind === 'unknown' && chatErr.message === 'Request cancelled.'
        ? 'cancelled'
        : 'error';
      void logUserQuery({
        query: trimmed,
        source: 'primary',
        status,
        userId: storageScope !== 'guest' ? storageScope : null,
        sessionId: activeSessionId,
        accessToken: sessionToken,
      });
    } finally {
      abortRef.current = null;
      setLoading(false);
      setStreamingContent('');
    }
  }, [loading, activeSessionId]);

  const stopGenerating = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const regenerate = useCallback(async () => {
    if (loading) return;
    // Find the last user message index using a reverse loop (O(n) without intermediate arrays)
    const currentMessages = messagesRef.current;
    let lastUserIdx = -1;
    for (let i = currentMessages.length - 1; i >= 0; i--) {
      if (currentMessages[i].role === 'user') { lastUserIdx = i; break; }
    }
    if (lastUserIdx === -1) return;
    const lastUserMsg = currentMessages[lastUserIdx];
    // Drop the last user message and everything after, then re-send
    updateMessages(msgs => msgs.slice(0, lastUserIdx));
    await sendMessage(lastUserMsg.content);
  }, [loading, updateMessages, sendMessage]);

  // -- Theme

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }, []);

  const clearAllData = useCallback(() => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(`${STORAGE_KEY}:${storageScope === 'global' ? 'user' : 'global'}`);
    localStorage.removeItem(THEME_KEY);
    localStorage.removeItem('cyber-ai-welcome-seen');
    const fresh = createSession();
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
    setLoading(false);
    setStreamingContent('');
    setError(null);
    setSearchQuery('');
    setSearchOpen(false);
    setSidebarOpen(false);
    setTheme('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  }, [storageKey, storageScope]);

  // -- Search

  const toggleSearch = useCallback(() => {
    setSearchOpen(o => !o);
    if (searchOpen) setSearchQuery('');
  }, [searchOpen]);

  // -- Sidebar

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(o => !o);
  }, []);

  // -- Export

  const exportMarkdown = useCallback(() => {
    if (messages.length === 0) return;
    const session = activeSession;
    const lines: string[] = [`# ${session.name}`, `*Exported from Cyber AI \u2014 ${new Date().toLocaleString()}*`, ''];
    for (const m of messages) {
      const label = m.role === 'user' ? '**You**' : '**Cyber AI**';
      const time = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      lines.push(`${label} \u2014 ${time}`, '', m.content, '', '---', '');
    }
    // UTF-8 BOM ensures editors and OS file associations decode the file correctly
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyber-ai-${session.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [messages, activeSession]);

  return {
    // Session state
    sessions,
    activeSessionId,
    activeSession,
    messages,
    // Chat state
    loading,
    streamingContent,
    error,
    theme,
    searchQuery,
    searchOpen,
    sidebarOpen,
    // Session actions
    newSession,
    switchSession,
    renameSession,
    deleteSession,
    clearMessages,
    // Message actions
    sendMessage,
    stopGenerating,
    regenerate,
    setFeedback,
    // UI actions
    toggleTheme,
    clearAllData,
    toggleSearch,
    setSearchQuery,
    toggleSidebar,
    setSidebarOpen,
    setError,
    // Export
    exportMarkdown,
  };
}
