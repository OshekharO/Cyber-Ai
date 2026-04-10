import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import './App.css';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const API_URL = 'https://ai-sqcn.onrender.com/api/chat';
const SYSTEM_PROMPT = 'You are Cyber AI, a helpful cybersecurity assistant.';

const SUGGESTIONS = [
  { icon: '🔐', text: 'What is a zero-day exploit?' },
  { icon: '🛡️', text: 'How does a firewall work?' },
  { icon: '🔑', text: 'Best practices for passwords' },
  { icon: '🕵️', text: 'What is phishing and how to prevent it?' },
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const nextId = useRef(1);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  const autoResize = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError(null);
    const userMsg: Message = {
      id: nextId.current++,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setLoading(true);

    const history = [...messages, userMsg];
    const apiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map(m => ({ role: m.role, content: m.content })),
    ];

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Client': 'Cyber-AI-Frontend',
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content;

      if (!reply) {
        throw new Error('Unexpected response format from server');
      }

      setMessages(prev => [
        ...prev,
        { id: nextId.current++, role: 'assistant', content: reply, timestamp: new Date() },
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [loading, messages]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }, [input, sendMessage]);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-brand">
          <div className="header-logo">🛡️</div>
          <div>
            <div className="header-title">Cyber AI</div>
            <div className="header-subtitle">Cybersecurity Assistant</div>
          </div>
        </div>
        <div className="header-status">
          <div className="status-dot" />
          Online
        </div>
      </header>

      {/* Chat */}
      <div className="chat-container">
        <div className="messages-area">
          {messages.length === 0 && !loading ? (
            <div className="welcome">
              <div className="welcome-icon">🔐</div>
              <h2>Welcome to <span>Cyber AI</span></h2>
              <p>
                Your AI-powered cybersecurity assistant. Ask about threats, defenses,
                best practices, or anything security-related.
              </p>
              <div className="suggestions">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s.text}
                    className="suggestion-chip"
                    onClick={() => sendMessage(s.text)}
                  >
                    <span className="chip-icon">{s.icon}</span>
                    {s.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map(msg => (
                <div key={msg.id} className={`message ${msg.role === 'user' ? 'user' : 'ai'}`}>
                  <div className={`avatar ${msg.role === 'user' ? 'user' : 'ai'}`}>
                    {msg.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div>
                    <div className="bubble">{msg.content}</div>
                    <div className="message-time">{formatTime(msg.timestamp)}</div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="typing-indicator">
                  <div className="avatar ai">🤖</div>
                  <div className="typing-bubble">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              )}

              {error && (
                <div className="error-banner">
                  ⚠️ {error}
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="input-area">
          <div className="input-row">
            <div className="input-wrapper">
              <textarea
                ref={textareaRef}
                className="chat-input"
                value={input}
                onChange={e => { setInput(e.target.value); autoResize(); }}
                onKeyDown={handleKeyDown}
                placeholder="Ask about cybersecurity…"
                rows={1}
                disabled={loading}
              />
            </div>
            <button
              className="send-btn"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              ➤
            </button>
          </div>
          <div className="input-hint">↵ Send &nbsp;·&nbsp; Shift+↵ New line</div>
        </div>
      </div>
    </div>
  );
}
