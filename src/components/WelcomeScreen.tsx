import { useState } from 'react';
import {
  FiAlertTriangle,
  FiUnlock,
  FiTarget,
  FiUser,
  FiZap,
  FiWrench,
  FiMap,
  FiBomb,
  FiSearch,
  FiFlag,
  FiGlobe,
  FiLock,
  FiKey,
  FiFileText,
  FiShield,
  FiClipboard,
  FiScale,
  FiCloud
} from 'react-icons/fi';

interface SuggestionItem {
  icon: string;
  text: string;
}

interface CategoryIconMap {
  [key: string]: any;
}

interface ItemIconMap {
  [key: string]: any;
}

const CATEGORY_ICONS: CategoryIconMap = {
  'Threats': FiAlertTriangle,
  'Tools': FiWrench,
  'CTF': FiFlag,
  'Compliance': FiClipboard
};

const ITEM_ICONS: ItemIconMap = {
  'Explain ransomware attack stages': FiUnlock,
  'What is a zero-day exploit?': FiTarget,
  'How do APT groups operate?': FiUser,
  'Difference between virus, worm, and trojan': FiZap,
  'How to use Nmap for network scanning?': FiMap,
  'Guide to Burp Suite web app testing': FiSearch,
  'Getting started with Metasploit': FiBomb,
  'How to analyse packets with Wireshark?': FiSearch,
  'Common web CTF vulnerabilities (XSS, SQLi)': FiGlobe,
  'Intro to binary exploitation (pwn)': FiLock,
  'RSA crypto CTF challenge approach': FiKey,
  'OSINT techniques for CTF competitions': FiUser,
  'NIST Cybersecurity Framework overview': FiShield,
  'OWASP Top 10 explained': FiFileText,
  'GDPR data breach requirements': FiScale,
  'Cloud security best practices (AWS/Azure/GCP)': FiCloud
};

const CATEGORIES: SuggestionCategory[] = [
  {
    label: 'Threats',
    icon: '',
    items: [
      { icon: '', text: 'Explain ransomware attack stages' },
      { icon: '', text: 'What is a zero-day exploit?' },
      { icon: '', text: 'How do APT groups operate?' },
      { icon: '', text: 'Difference between virus, worm, and trojan' },
    ],
  },
  {
    label: 'Tools',
    icon: '',
    items: [
      { icon: '', text: 'How to use Nmap for network scanning?' },
      { icon: '', text: 'Guide to Burp Suite web app testing' },
      { icon: '', text: 'Getting started with Metasploit' },
      { icon: '', text: 'How to analyse packets with Wireshark?' },
    ],
  },
  {
    label: 'CTF',
    icon: '',
    items: [
      { icon: '', text: 'Common web CTF vulnerabilities (XSS, SQLi)' },
      { icon: '', text: 'Intro to binary exploitation (pwn)' },
      { icon: '', text: 'RSA crypto CTF challenge approach' },
      { icon: '', text: 'OSINT techniques for CTF competitions' },
    ],
  },
  {
    label: 'Compliance',
    icon: '',
    items: [
      { icon: '', text: 'NIST Cybersecurity Framework overview' },
      { icon: '', text: 'OWASP Top 10 explained' },
      { icon: '', text: 'GDPR data breach requirements' },
      { icon: '', text: 'Cloud security best practices (AWS/Azure/GCP)' },
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
        <div className="welcome-logo" aria-hidden="true">
          <FiShield size={48} />
        </div>
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
              <CATEGORY_ICONS[cat.label] aria-hidden="true" size={18} />
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
              <ITEM_ICONS[s.text] className="chip-icon" aria-hidden="true" size={18} />
              <span className="chip-text">{s.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
