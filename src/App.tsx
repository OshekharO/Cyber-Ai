import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import './App.css';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const API_URL = 'https://ai-sqcn.onrender.com/api/chat';
const SYSTEM_PROMPT = `You are Cyber AI, an elite cybersecurity assistant with decades of combined expertise \
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
