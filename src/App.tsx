import { isValidElement, useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './App.css';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type ConnectionStatus = 'online' | 'slow' | 'offline';

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

const SUGGESTION_CATEGORIES = [
  {
    icon: '🏁',
    title: 'CTF',
    prompts: [
      'How should I approach a beginner web CTF challenge?',
      'Give me hints for solving basic XOR crypto challenges.',
      'How do I build a safe CTF practice lab at home?',
    ],
  },
  {
    icon: '🌐',
    title: 'Network Security',
    prompts: [
      'How does network segmentation reduce attack impact?',
      'What are practical firewall hardening best practices?',
      'How can I investigate suspicious traffic with Wireshark?',
    ],
  },
  {
    icon: '🛠️',
    title: 'Penetration Testing',
    prompts: [
      'What is a legal and ethical pentest workflow?',
      'How do I structure recon before active testing?',
      'How do I write a clear penetration test report?',
    ],
  },
  {
    icon: '🔒',
    title: 'Cryptography',
    prompts: [
      'What is the difference between hashing and encryption?',
      'When should I use AES-GCM instead of CBC?',
      'How does public key infrastructure work in practice?',
    ],
  },
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }, [code]);

  return (
    <div className="code-block">
      <button className="code-copy-btn" onClick={copyCode} type="button">
        {copied ? 'Copied' : 'Copy code'}
      </button>
      <SyntaxHighlighter
        style={oneDark}
        language={language || 'text'}
        PreTag="div"
        wrapLongLines
        customStyle={{ margin: 0, borderRadius: 8, paddingTop: 36 }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        pre({ children }) {
          const child = Array.isArray(children) ? children[0] : children;
          if (isValidElement<{ className?: string; children?: unknown }>(child)) {
            const className = child.props.className || '';
            const match = /language-(\w+)/.exec(className);
            const code = String(child.props.children ?? '').replace(/\n$/, '');
            return <CodeBlock language={match?.[1] || 'text'} code={code} />;
          }

          return <pre>{children}</pre>;
        },
        code(props) {
          const { className, children, ...rest } = props;
          return (
            <code className={className} {...rest}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [activeCategory, setActiveCategory] = useState(SUGGESTION_CATEGORIES[0].title);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('online');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const nextId = useRef(1);
  const inFlightRef = useRef(false);
  const messagesRef = useRef<Message[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

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

  const sendMessage = useCallback(async (text: string, options?: { retry?: boolean }) => {
    const trimmed = text.trim();
    if (!trimmed || inFlightRef.current) return;
    inFlightRef.current = true;

    setError(null);
    const isRetry = options?.retry ?? false;
    let history: Message[];

    if (isRetry) {
      history = [...messagesRef.current];
    } else {
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
      history = [...messagesRef.current, userMsg];
    }
    setLoading(true);

    const startedAt = performance.now();
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
      setLastFailedMessage(null);
      setConnectionStatus(performance.now() - startedAt > 2500 ? 'slow' : 'online');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
      setLastFailedMessage(trimmed);
      setConnectionStatus('offline');
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }, [input, sendMessage]);
  const selectedCategory = SUGGESTION_CATEGORIES.find(category => category.title === activeCategory);

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
        <div className={`header-status ${connectionStatus}`}>
          <div className="status-dot" />
          {connectionStatus === 'online' ? 'Online' : connectionStatus === 'slow' ? 'Slow response' : 'Offline'}
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
                <div className="suggestion-categories">
                  {SUGGESTION_CATEGORIES.map(category => (
                    <button
                      key={category.title}
                      className={`suggestion-chip ${activeCategory === category.title ? 'active' : ''}`}
                      onClick={() => setActiveCategory(category.title)}
                      type="button"
                    >
                      <span className="chip-icon">{category.icon}</span>
                      {category.title}
                    </button>
                  ))}
                </div>

                {selectedCategory && (
                  <div className="suggestion-prompts">
                    {selectedCategory.prompts.map(prompt => (
                      <button
                        key={prompt}
                        className="prompt-chip"
                        onClick={() => sendMessage(prompt)}
                        type="button"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
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
                    <div className="bubble">
                      {msg.role === 'assistant' ? (
                        <div className="markdown-content">
                          <MarkdownMessage content={msg.content} />
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
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
                  <span>⚠️ {error}</span>
                  {lastFailedMessage && (
                    <button
                      className="retry-btn"
                      onClick={() => sendMessage(lastFailedMessage, { retry: true })}
                      disabled={loading}
                      type="button"
                    >
                      Retry
                    </button>
                  )}
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
