import { useState } from 'react';
import { FiShield, FiLock, FiSearch, FiCode, FiGlobe, FiAward, FiArrowRight, FiMenu, FiX } from 'react-icons/fi';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const features = [
    {
      icon: <FiSearch size={24} />,
      title: 'Threat Analysis',
      description: 'Deep-dive into malware, ransomware, APTs, and CVE explanations with actionable, security-focused guidance.',
    },
    {
      icon: <FiCode size={24} />,
      title: 'CTF & Ethical Hacking',
      description: 'Structured hints and step-by-step walkthroughs for CTF categories — web, pwn, crypto, forensics, and more.',
    },
    {
      icon: <FiGlobe size={24} />,
      title: 'Pentesting Mastery',
      description: 'Metasploit, Burp Suite, Nmap, SQLMap, and industry tools explained with exact workflows and payloads.',
    },
    {
      icon: <FiLock size={24} />,
      title: 'Secure Coding & DevSecOps',
      description: 'OWASP Top 10, input validation, secrets management, SAST/DAST, and CI/CD security best practices.',
    },
    {
      icon: <FiShield size={24} />,
      title: 'Compliance & Frameworks',
      description: 'NIST CSF, ISO 27001, SOC 2, GDPR, CIS Benchmarks, and MITRE ATT&CK mapped to real-world steps.',
    },
    {
      icon: <FiAward size={24} />,
      title: 'Learning & Labs',
      description: 'HTB, TryHackMe, Kali Linux, Docker-based vulnerable environments, and guided skill-building paths.',
    },
  ];

  const stats = [
    { value: '326+', label: 'CVE databases queried' },
    { value: '50+', label: 'Tools documented' },
    { value: '12', label: 'CTF categories covered' },
    { value: '24/7', label: 'Always-on assistant' },
  ];

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-brand">
            <div className="landing-logo" aria-hidden="true">
              <FiShield size={22} />
            </div>
            <span className="landing-brand-text">Cyber AI</span>
          </div>

          <button className="landing-mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>

          <div className={`landing-nav-links${menuOpen ? ' landing-nav-links--open' : ''}`}>
            <a href="#features" className="landing-nav-link" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="landing-nav-link" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#use-cases" className="landing-nav-link" onClick={() => setMenuOpen(false)}>Use cases</a>
            <button className="landing-nav-cta" onClick={() => { setMenuOpen(false); onGetStarted(); }}>
              Get Started <FiArrowRight size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="landing-hero">
        <div className="landing-hero-bg" aria-hidden="true" />
        <div className="landing-hero-content">
          <div className="landing-hero-badge">
            <span className="landing-hero-badge-dot" aria-hidden="true" />
            Elite Cybersecurity Assistant
          </div>
          <h1 className="landing-hero-title">
            Think like a hacker.<br />
            Defend like a <span className="landing-accent">pro</span>.
          </h1>
          <p className="landing-hero-subtitle">
            Cyber AI is your always-on security co-pilot — from threat analysis and pentesting workflows to CTF coaching and compliance-ready explanations.
          </p>
          <div className="landing-hero-actions">
            <button className="landing-hero-primary" onClick={onGetStarted}>
              Start Hacking (Ethically) <FiArrowRight size={18} />
            </button>
            <a href="#features" className="landing-hero-secondary">Explore Features</a>
          </div>
          <p className="landing-hero-footnote">Built for security professionals, students, and enthusiasts. For educational purposes.</p>
        </div>
      </header>

      {/* Stats */}
      <section className="landing-stats">
        <div className="landing-stats-grid">
          {stats.map(stat => (
            <div key={stat.label} className="landing-stat">
              <span className="landing-stat-value">{stat.value}</span>
              <span className="landing-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="landing-section">
        <div className="landing-section-inner">
          <div className="landing-section-header">
            <span className="landing-section-kicker">Features</span>
            <h2 className="landing-section-title">What Cyber AI can do</h2>
            <p className="landing-section-subtitle">Offensive, defensive, and educational — all in one interface.</p>
          </div>
          <div className="landing-features-grid">
            {features.map(f => (
              <article key={f.title} className="landing-feature-card">
                <div className="landing-feature-icon">{f.icon}</div>
                <h3 className="landing-feature-title">{f.title}</h3>
                <p className="landing-feature-desc">{f.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="landing-section landing-section--alt">
        <div className="landing-section-inner">
          <div className="landing-section-header">
            <span className="landing-section-kicker">How it works</span>
            <h2 className="landing-section-title">From question to answer — fast</h2>
          </div>
          <div className="landing-steps">
            {[
              { n: '01', title: 'Ask anything', body: 'Type a security question, paste a CVE ID, drop in a log snippet, or describe a target scenario.' },
              { n: '02', title: 'Get expert analysis', body: 'Cyber AI returns practical, structured guidance — tool commands, threat breakdowns, remediation steps.' },
              { n: '03', title: 'Act ethically', body: 'Every response is rooted in responsible disclosure, legal boundaries, and real-world defensive strategy.' },
            ].map(step => (
              <div key={step.n} className="landing-step">
                <span className="landing-step-num">{step.n}</span>
                <h3 className="landing-step-title">{step.title}</h3>
                <p className="landing-step-body">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section id="use-cases" className="landing-section">
        <div className="landing-section-inner">
          <div className="landing-section-header">
            <span className="landing-section-kicker">Use cases</span>
            <h2 className="landing-section-title">Built for the full spectrum</h2>
          </div>
          <div className="landing-chips">
            {[
              'Threat Intelligence',
              'Penetration Testing',
              'CTF Coaching',
              'Burp Suite Workflows',
              'Secure Code Review',
              'Compliance Mapping',
              'Incident Response',
              'Red Team / Blue Team',
              'Cloud Hardening',
              'Cryptography 101',
              'OSINT Investigations',
              'Malware Analysis',
            ].map(tag => (
              <span key={tag} className="landing-chip">{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <div className="landing-cta-card">
          <h2 className="landing-cta-title">Ready to level up your cybersecurity skills?</h2>
          <p className="landing-cta-subtitle">Join the community and start your first secure session today.</p>
          <button className="landing-cta-btn" onClick={onGetStarted}>
            Get Started <FiArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <div className="landing-logo" aria-hidden="true">
              <FiShield size={18} />
            </div>
            <span>Cyber AI</span>
          </div>
          <p className="landing-footer-copy">Educational purposes only. Always hack responsibly.</p>
          <p className="landing-footer-copy">Built by <strong>Saksham Shekher</strong> and <strong>Ayan Kar</strong></p>
        </div>
      </footer>
    </div>
  );
}
