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

const TERMINAL_LINES = [
  '> Cyber AI v2.0 initializing…',
  '> Threat intelligence engine: READY',
  '> Security knowledge base: LOADED',
  '> How can I assist you today?',
];

interface WelcomeScreenProps {
  onSend: (text: string) => void;
}

export function WelcomeScreen({ onSend }: WelcomeScreenProps) {
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0].label);

  const active = CATEGORIES.find(c => c.label === activeCategory) ?? CATEGORIES[0];

  return (
    <div className="welcome">
      {/* Animated terminal intro */}
      <div className="terminal-intro" aria-live="polite">
        {TERMINAL_LINES.map((line, i) => (
          <div
            key={line}
            className={`terminal-line terminal-line--${i}`}
            aria-hidden={i < TERMINAL_LINES.length - 1}
          >
            {line}{i === TERMINAL_LINES.length - 1 && <span className="terminal-cursor" aria-hidden="true">█</span>}
          </div>
        ))}
      </div>

      {/* Category tabs */}
      <div className="suggestion-tabs" role="tablist" aria-label="Suggestion categories">
        {CATEGORIES.map(cat => (
          <button
            key={cat.label}
            role="tab"
            aria-selected={cat.label === activeCategory}
            className={`suggestion-tab${cat.label === activeCategory ? ' suggestion-tab--active' : ''}`}
            onClick={() => setActiveCategory(cat.label)}
          >
            <span aria-hidden="true">{cat.icon}</span> {cat.label}
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
            {s.text}
          </button>
        ))}
      </div>
    </div>
  );
}
