import { useState } from 'react';

interface SuggestionItem {
  icon: string;
  text: string;
}

interface SuggestionCategory {
  label: string;
  icon: string;
  items: SuggestionItem[];
}

const CATEGORIES: SuggestionCategory[] = [
  {
    label: 'Threats',
    icon: '⚠️',
    items: [
      { icon: '🔓', text: 'Explain ransomware attack stages' },
      { icon: '🎯', text: 'What is a zero-day exploit?' },
      { icon: '🕵️', text: 'How do APT groups operate?' },
      { icon: '🦠', text: 'Difference between virus, worm, and trojan' },
    ],
  },
  {
    label: 'Tools',
    icon: '🔧',
    items: [
      { icon: '🗺️', text: 'How to use Nmap for network scanning?' },
      { icon: '🕷️', text: 'Guide to Burp Suite web app testing' },
      { icon: '💣', text: 'Getting started with Metasploit' },
      { icon: '🔎', text: 'How to analyse packets with Wireshark?' },
    ],
  },
  {
    label: 'CTF',
    icon: '🏁',
    items: [
      { icon: '🌐', text: 'Common web CTF vulnerabilities (XSS, SQLi)' },
      { icon: '🔐', text: 'Intro to binary exploitation (pwn)' },
      { icon: '🔑', text: 'RSA crypto CTF challenge approach' },
      { icon: '🕵️', text: 'OSINT techniques for CTF competitions' },
    ],
  },
  {
    label: 'Compliance',
    icon: '📋',
    items: [
      { icon: '🛡️', text: 'NIST Cybersecurity Framework overview' },
      { icon: '📝', text: 'OWASP Top 10 explained' },
      { icon: '⚖️', text: 'GDPR data breach requirements' },
      { icon: '☁️', text: 'Cloud security best practices (AWS/Azure/GCP)' },
    ],
  },
];

interface WelcomeScreenProps {
  onSend: (text: string) => void;
}

export function WelcomeScreen({ onSend }: WelcomeScreenProps) {
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0].label);

  const active = CATEGORIES.find(c => c.label === activeCategory) ?? CATEGORIES[0];

  return (
    <div className="welcome">
      {/* Hero section */}
      <div className="welcome-hero">
        <div className="welcome-logo" aria-hidden="true">🛡️</div>
        <h1 className="welcome-title">Cyber AI</h1>
        <p className="welcome-subtitle">Your AI-powered cybersecurity assistant</p>
        <div className="terminal-badge" aria-label="System ready">
          <span className="terminal-dot" aria-hidden="true" />
          <span>System Ready</span>
        </div>
      </div>

      {/* Category tabs */}
      <div className="suggestion-section">
        <p className="suggestion-label">Try asking about…</p>
        <div className="suggestion-tabs" role="tablist" aria-label="Suggestion categories">
          {CATEGORIES.map(cat => (
            <button
              key={cat.label}
              role="tab"
              aria-selected={cat.label === activeCategory}
              className={`suggestion-tab${cat.label === activeCategory ? ' suggestion-tab--active' : ''}`}
              onClick={() => setActiveCategory(cat.label)}
            >
              <span aria-hidden="true">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Suggestion chips */}
        <div className="suggestions" role="tabpanel" aria-label={`${active.label} suggestions`}>
          {active.items.map(s => (
            <button
              key={s.text}
              className="suggestion-chip"
              onClick={() => onSend(s.text)}
            >
              <span className="chip-icon" aria-hidden="true">{s.icon}</span>
              <span className="chip-text">{s.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
