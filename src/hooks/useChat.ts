import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { streamChat } from '../api/chat.ts';
import type { ChatMessage, ChatError } from '../api/chat.ts';

// ── Types ────────────────────────────────────────────────────────────────────

export interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO string
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

export const SYSTEM_PROMPT = `You are Cyber AI, an elite cybersecurity assistant with decades of combined expertise \
across offensive security, defensive operations, threat intelligence, and full-stack engineering. \
You assist security professionals, developers, students, and enthusiasts with:

• Threat analysis & incident response — malware, ransomware, APTs, CVE explanations
• Penetration testing & ethical hacking — methodologies, tools (Metasploit, Burp Suite, Nmap, Wireshark, Nikto, SQLMap, Hydra, John the Ripper, Hashcat, Gobuster, ffuf), and techniques
• CTF (Capture The Flag) competitions — challenge categories (web, pwn/binary exploitation, reverse engineering, forensics, cryptography, OSINT, steganography, misc), walkthroughs, tool recommendations, and learning resources (HackTheBox, TryHackMe, PicoCTF, CTFtime)
• Burp Suite mastery — intercepting and replaying requests, Scanner, Intruder, Repeater, Sequencer, Decoder, Comparer, active/passive scanning, extensions (BApp Store), and intercepting mobile app traffic
• Secure coding & DevSecOps — OWASP Top 10, input validation, secrets management, SAST/DAST, CI/CD security
• Network & infrastructure security — firewalls, IDS/IPS, VPNs, zero-trust architecture, segmentation, packet analysis with Wireshark/tcpdump
• Cryptography & PKI — TLS/SSL, symmetric/asymmetric encryption, hashing, certificate management, common CTF crypto challenges (XOR, RSA, base encodings)
• Identity & access management — MFA, OAuth 2.0, SAML, RBAC, least-privilege principles
• Cloud security — AWS/GCP/Azure hardening, misconfiguration detection, shared-responsibility model
• Compliance & frameworks — NIST CSF, ISO 27001, SOC 2, GDPR, CIS Benchmarks, MITRE ATT&CK
• Security awareness — social engineering, phishing, insider threats, safe browsing habits
• Security tooling & labs — Kali Linux, Parrot OS, VirtualBox/VMware lab setup, Docker-based vulnerable environments (DVWA, VulnHub, Hack The Box machines)

Personality & communication style:
- Be precise, practical, and direct — prioritise actionable advice over theory
- Use clear structure (numbered steps, bullet points, code blocks) for technical guidance
- For CTF challenges, offer structured hints before full spoilers — ask the user how much help they want
- Provide Burp Suite step-by-step workflows with exact menu paths and payload examples where relevant
- Adapt depth to the user's apparent skill level; explain jargon when introducing it
- When discussing offensive techniques, always frame them within ethical, legal, and responsible-disclosure contexts
- Never assist with illegal activity, actual malware creation, or attacks against systems without authorisation
- If a question is ambiguous, ask one focused clarifying question before answering

Always respond in the same language the user writes in.`;

// ── Persistence helpers ───────────────────────────────────────────────────────

function createSession(name = 'New Chat'): Session {
  const now = new Date().toISOString();
  return { id: crypto.randomUUID(), name, messages: [], createdAt: now, updatedAt: now };
}

function loadSessions(): Session[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Session[];
  } catch {
    return [];
  }
}

function saveSessions(sessions: Session[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
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

export function useChat() {
  // -- State
  const [sessions, setSessions] = useState<Session[]>(() => {
    const stored = loadSessions();
    return stored.length > 0 ? stored : [createSession()];
  });
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const stored = loadSessions();
    return stored.length > 0 ? stored[0].id : '';
  });
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<ChatError | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(loadTheme);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // -- Refs
  const abortRef = useRef<AbortController | null>(null);
  const nextId = useRef(1);

  // On mount, sync nextId from stored data
  useEffect(() => {
    const stored = loadSessions();
    nextId.current = computeMaxId(stored) + 1;
    // Ensure activeSessionId is valid
    if (stored.length > 0) {
      setActiveSessionId(stored[0].id);
    }
  }, []);

  // Persist sessions whenever they change
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

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

    // Build API messages from updated session
    const history = [...messages, userMsg];
    const apiMessages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ];

    let accumulated = '';
    try {
      await streamChat(
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
    } catch (err: unknown) {
      const chatErr = err as ChatError;
      // Don't show error for user-initiated cancellation
      if (chatErr.kind !== 'unknown' || chatErr.message !== 'Request cancelled.') {
        setError(chatErr);
      }
    } finally {
      abortRef.current = null;
      setLoading(false);
      setStreamingContent('');
    }
  }, [loading, messages, activeSessionId]);

  const stopGenerating = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const regenerate = useCallback(async () => {
    if (loading) return;
    // Find the last user message index using a reverse loop (O(n) without intermediate arrays)
    let lastUserIdx = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') { lastUserIdx = i; break; }
    }
    if (lastUserIdx === -1) return;
    const lastUserMsg = messages[lastUserIdx];
    // Drop the last user message and everything after, then re-send
    updateMessages(msgs => msgs.slice(0, lastUserIdx));
    await sendMessage(lastUserMsg.content);
  }, [loading, messages, updateMessages, sendMessage]);

  // -- Theme

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }, []);

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
    const lines: string[] = [`# ${session.name}`, `*Exported from Cyber AI — ${new Date().toLocaleString()}*`, ''];
    for (const m of messages) {
      const label = m.role === 'user' ? '**You**' : '**Cyber AI**';
      const time = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      lines.push(`${label} — ${time}`, '', m.content, '', '---', '');
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
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
    toggleSearch,
    setSearchQuery,
    toggleSidebar,
    setSidebarOpen,
    setError,
    // Export
    exportMarkdown,
  };
}
