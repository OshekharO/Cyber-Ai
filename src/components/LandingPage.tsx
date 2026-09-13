import { useState } from 'react';
import {
  FiShield, FiLock, FiSearch, FiCode, FiGlobe, FiAward, FiArrowRight,
  FiMenu, FiX, FiTerminal, FiCpu, FiCheckCircle, FiChevronDown, FiZap,
  FiActivity, FiCopy, FiCheck, FiLayers, FiUsers, FiPlay, FiCheckSquare
} from 'react-icons/fi';

interface LandingPageProps {
  onGetStarted: () => void;
}

interface TerminalPreset {
  id: string;
  label: string;
  command: string;
  output: { type: 'info' | 'critical' | 'warning' | 'success' | 'detail'; text: string }[];
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'offensive' | 'defensive' | 'learning'>('all');
  const [copiedTerminal, setCopiedTerminal] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activePresetId, setActivePresetId] = useState<string>('cve');

  const terminalPresets: TerminalPreset[] = [
    {
      id: 'cve',
      label: 'CVE Query',
      command: 'cyber-ai query cve --id CVE-2024-21626 --deep-scan',
      output: [
        { type: 'info', text: '[+] Querying NVD, MITRE ATT&CK & VulnDB databases...' },
        { type: 'critical', text: '[!] CRITICAL: runc container breakout via file descriptor leak' },
        { type: 'warning', text: '[>] CVSS Score: 8.6 (HIGH) | Vector: CVSS:3.1/AV:L/AC:L/PR:N/UI:N' },
        { type: 'success', text: '[>] Mitigation: Upgrade runc to 1.1.12+ or enforce AppArmor profile' },
        { type: 'detail', text: '[>] Exploit Analysis: Leaked cwd fd allows container escape to host root fs.' }
      ]
    },
    {
      id: 'nmap',
      label: 'Nmap Audit',
      command: 'cyber-ai analyze nmap -f scan_results.xml --ai-hardening',
      output: [
        { type: 'info', text: '[+] Parsing XML scan output (3 host(s) up, 14 open ports)...' },
        { type: 'critical', text: '[!] Open Port: 445/tcp (SMBv1) -> Vulnerable to MS17-010 (EternalBlue)' },
        { type: 'warning', text: '[>] Defensive Action: Disable SMBv1 immediately via PowerShell' },
        { type: 'success', text: '[>] Command: Set-SmbServerConfiguration -EnableSMB1Protocol $false' },
        { type: 'detail', text: '[>] Firewall Rule: Block inbound port 445 on external perimeter interfaces.' }
      ]
    },
    {
      id: 'pwn',
      label: 'CTF Pwn',
      command: 'cyber-ai ctf-solve --category pwn --binary ./vuln_target',
      output: [
        { type: 'info', text: '[+] Decompiling ELF64 binary with Ghidra analysis engine...' },
        { type: 'critical', text: '[!] Vulnerability: Stack-based Buffer Overflow in vulnerable_read()' },
        { type: 'warning', text: '[>] Calculated Offset: 72 bytes | ROP Gadget: 0x4011d3 (pop rdi; ret)' },
        { type: 'success', text: '[>] Generated Pwntools Exploit Template saved to ./exploit.py' },
        { type: 'detail', text: '[>] Interactive Shell payload ready for remote execution.' }
      ]
    },
    {
      id: 'sast',
      label: 'DevSecOps',
      command: 'cyber-ai audit sast --repo ./src --policy owasp-top-10',
      output: [
        { type: 'info', text: '[+] Scanning 142 source files for hardcoded secrets & SQL injection...' },
        { type: 'critical', text: '[!] Hardcoded Secret: AWS API Key detected in src/config/aws.ts:24' },
        { type: 'warning', text: '[>] Patch Suggested: Inject variable via process.env.AWS_SECRET_KEY' },
        { type: 'success', text: '[+] Compliance Score: 94% (A Grade) | SAST Checks Passed' },
        { type: 'detail', text: '[>] Automated GitHub Action PR generated for secret rotation.' }
      ]
    }
  ];

  const currentPreset = terminalPresets.find(p => p.id === activePresetId) || terminalPresets[0];

  const features = [
    {
      id: 'threat-analysis',
      category: 'defensive',
      icon: <FiSearch size={22} />,
      title: 'Threat Analysis & CVEs',
      description: 'Deep-dive into malware heuristics, ransomware chains, zero-days, and CVE explanations with actionable, security-focused remediation.',
      badge: 'Real-time',
    },
    {
      id: 'ctf-coaching',
      category: 'learning',
      icon: <FiCode size={22} />,
      title: 'CTF Walkthroughs & Hints',
      description: 'Structured, spoiler-managed hints and walkthroughs for Web, Pwn, Crypto, Forensics, Reverse Engineering, and Hardware.',
      badge: 'Interactive',
    },
    {
      id: 'pentesting',
      category: 'offensive',
      icon: <FiGlobe size={22} />,
      title: 'Pentesting Workflows',
      description: 'Metasploit, Burp Suite, Nmap, SQLMap, and custom exploit development explained with exact commands and parameters.',
      badge: 'Offensive',
    },
    {
      id: 'secure-coding',
      category: 'defensive',
      icon: <FiLock size={22} />,
      title: 'Secure DevSecOps & SAST',
      description: 'OWASP Top 10 mitigation, secret scanning, CI/CD pipeline security, SAST/DAST integration, and input validation design.',
      badge: 'DevSecOps',
    },
    {
      id: 'compliance',
      category: 'defensive',
      icon: <FiShield size={22} />,
      title: 'Compliance & Frameworks',
      description: 'NIST CSF, ISO 27001, SOC 2, GDPR, CIS Benchmarks, and MITRE ATT&CK technique mapping for audit readiness.',
      badge: 'Governance',
    },
    {
      id: 'labs-skills',
      category: 'learning',
      icon: <FiAward size={22} />,
      title: 'Guided Labs & Environment Prep',
      description: 'HackTheBox, TryHackMe, Kali Linux setups, Dockerized vulnerable environments, and customized skill roadmaps.',
      badge: 'Hands-on',
    },
  ];

  const filteredFeatures = activeTab === 'all'
    ? features
    : features.filter(f => f.category === activeTab);

  const stats = [
    { value: '326,000+', label: 'CVE Records Parsed', detail: 'NVD, MITRE ATT&CK & CISA' },
    { value: '50+', label: 'Security Tools Mastered', detail: 'Nmap, Metasploit, Burp & Ghidra' },
    { value: '12', label: 'CTF Domains Covered', detail: 'Binary, Crypto, Web & OSINT' },
    { value: '99.9%', label: 'Uptime & Speed', detail: 'Sub-second AI security analysis' },
  ];

  const faqs = [
    {
      q: 'What is Cyber AI and who is it designed for?',
      a: 'Cyber AI is an AI-powered intelligence co-pilot designed for cybersecurity engineers, penetration testers, SOC analysts, CTF competitors, and students. It assists with threat research, CTF hints, payload synthesis, and compliance mapping.'
    },
    {
      q: 'Is Cyber AI strictly safe and legal to use?',
      a: 'Yes. Cyber AI adheres to ethical hacking guidelines, legal boundaries, and responsible disclosure practices. It provides technical knowledge for defense, vulnerability analysis, and authorized penetration testing.'
    },
    {
      q: 'Can Cyber AI generate specific tool commands like Nmap or Metasploit?',
      a: 'Absolutely. Cyber AI understands command-line tools across Linux and Windows environments, providing syntax, explanation of flags, and recommended defense configurations.'
    },
    {
      q: 'Is there a light theme supported?',
      a: 'Yes, Cyber AI seamlessly toggles between dark and light themes while maintaining high contrast and accessibility across all screen sizes.'
    }
  ];

  const handleCopyTerminal = () => {
    const textToCopy = `${currentPreset.command}\n` + currentPreset.output.map(o => o.text).join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopiedTerminal(true);
    setTimeout(() => setCopiedTerminal(false), 2000);
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <div className="landing">
      {/* Background glow & grid effect */}
      <div className="landing-bg-grid" aria-hidden="true" />

      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-brand">
            <div className="landing-logo" aria-hidden="true">
              <FiShield size={20} />
            </div>
            <span className="landing-brand-text">Cyber AI</span>
            <span className="landing-brand-badge">v2.0</span>
          </div>

          <button
            className="landing-mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Navigation Menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>

          <div className={`landing-nav-links${menuOpen ? ' landing-nav-links--open' : ''}`}>
            <a href="#features" className="landing-nav-link" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#terminal" className="landing-nav-link" onClick={() => setMenuOpen(false)}>Terminal</a>
            <a href="#how-it-works" className="landing-nav-link" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#use-cases" className="landing-nav-link" onClick={() => setMenuOpen(false)}>Use cases</a>
            <a href="#faq" className="landing-nav-link" onClick={() => setMenuOpen(false)}>FAQ</a>
            <button className="landing-nav-cta" onClick={() => { setMenuOpen(false); onGetStarted(); }}>
              Launch Workspace <FiArrowRight size={15} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="landing-hero">
        <div className="landing-hero-bg" aria-hidden="true" />
        <div className="landing-hero-container">
          <div className="landing-hero-badge">
            <span className="landing-hero-badge-dot" aria-hidden="true" />
            <FiZap className="landing-badge-icon" size={13} />
            <span>Next-Gen Security Copilot</span>
          </div>

          <h1 className="landing-hero-title">
            Think like an attacker.<br />
            Defend like a <span className="landing-accent">cyber master</span>.
          </h1>

          <p className="landing-hero-subtitle">
            An advanced AI assistant engineered for threat hunters, red teams, blue teams, and CTF players. Accelerate analysis, simplify pentesting, and enforce DevSecOps.
          </p>

          <div className="landing-hero-actions">
            <button className="landing-hero-primary" onClick={onGetStarted}>
              <span>Get Started Free</span>
              <FiArrowRight size={18} />
            </button>
            <a href="#terminal" className="landing-hero-secondary">
              <FiTerminal size={16} />
              <span>Demo Terminal</span>
            </a>
          </div>

          <div className="landing-hero-trust">
            <div className="trust-item">
              <FiCheckCircle size={15} className="trust-icon" />
              <span>No Credit Card Required</span>
            </div>
            <div className="trust-divider" />
            <div className="trust-item">
              <FiShield size={15} className="trust-icon" />
              <span>Ethical & Compliant</span>
            </div>
            <div className="trust-divider" />
            <div className="trust-item">
              <FiCpu size={15} className="trust-icon" />
              <span>Instant AI Streaming</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Terminal - Masterpiece Edition */}
        <div className="landing-hero-preview-wrapper" id="terminal">
          <div className="landing-terminal-window">
            {/* Terminal Header Bar */}
            <div className="landing-terminal-header">
              <div className="terminal-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>

              <div className="terminal-presets-bar">
                {terminalPresets.map(preset => (
                  <button
                    key={preset.id}
                    className={`terminal-preset-btn ${activePresetId === preset.id ? 'active' : ''}`}
                    onClick={() => setActivePresetId(preset.id)}
                  >
                    <FiPlay size={10} className="preset-icon" />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>

              <div className="terminal-header-right">
                <span className="terminal-live-badge">
                  <span className="pulse-dot" /> LIVE SESSION
                </span>
                <button
                  className="terminal-copy-btn"
                  onClick={handleCopyTerminal}
                  title="Copy Terminal Snippet"
                  aria-label="Copy terminal text"
                >
                  {copiedTerminal ? <FiCheck size={14} className="copied" /> : <FiCopy size={14} />}
                </button>
              </div>
            </div>

            {/* Terminal Content Body */}
            <div className="landing-terminal-body">
              <div className="terminal-scanline" aria-hidden="true" />

              <div className="terminal-prompt-line">
                <span className="term-user">cyber-ai@kernel</span>
                <span className="term-sep">:</span>
                <span className="term-path">~#</span>
                <span className="term-cmd">{currentPreset.command}</span>
              </div>

              <div className="terminal-output-container">
                {currentPreset.output.map((line, idx) => (
                  <div key={idx} className={`term-line term-${line.type}`}>
                    {line.text}
                  </div>
                ))}
                <div className="term-line term-prompt-idle">
                  <span className="term-user">cyber-ai@kernel</span>
                  <span className="term-sep">:</span>
                  <span className="term-path">~#</span>
                  <span className="term-cursor" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section - 2-Column Grid on Mobile, 4-Column on Desktop */}
      <section className="landing-stats">
        <div className="landing-container">
          <div className="landing-stats-grid">
            {stats.map(stat => (
              <div key={stat.label} className="landing-stat-card">
                <span className="landing-stat-value">{stat.value}</span>
                <span className="landing-stat-label">{stat.label}</span>
                <span className="landing-stat-detail">{stat.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ticker Section */}
      <div className="ticker" aria-hidden="true">
        <div className="marquee-track">
          <div className="marquee-group">
            <span><b>GPT 5.6 Sol</b></span><span className="sep">//</span>
            <span><b>Claude Opus 5</b></span><span className="sep">//</span>
            <span><b>DeepSeek V4 Pro</b></span><span className="sep">//</span>
            <span><b>Kimi K3</b></span><span className="sep">//</span>
            <span><b>GLM 5.3</b></span><span className="sep">//</span>
            <span>from <b>Rp170 / 1M token</b></span><span className="sep">//</span>
            <span>pay via <b>QRIS &middot; e-wallet &middot; Crypto USDT</b></span><span className="sep">//</span>
          </div>
          <div className="marquee-group">
            <span><b>GPT 5.6 Sol</b></span><span className="sep">//</span>
            <span><b>Claude Opus 5</b></span><span className="sep">//</span>
            <span><b>DeepSeek V4 Pro</b></span><span className="sep">//</span>
            <span><b>Kimi K3</b></span><span className="sep">//</span>
            <span><b>GLM 5.3</b></span><span className="sep">//</span>
            <span>from <b>Rp170 / 1M token</b></span><span className="sep">//</span>
            <span>pay via <b>QRIS &middot; e-wallet &middot; Crypto USDT</b></span><span className="sep">//</span>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="landing-section">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="landing-section-kicker">
              <FiLayers size={13} /> Capabilities
            </span>
            <h2 className="landing-section-title">Built for the Complete Security Lifecycle</h2>
            <p className="landing-section-subtitle">
              Offensive analysis, defensive hardening, and educational coaching in one streamlined interface.
            </p>

            {/* Category Filter Tabs */}
            <div className="landing-feature-tabs" role="tablist">
              <button
                className={`feature-tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Features
              </button>
              <button
                className={`feature-tab ${activeTab === 'offensive' ? 'active' : ''}`}
                onClick={() => setActiveTab('offensive')}
              >
                Offensive & Pentesting
              </button>
              <button
                className={`feature-tab ${activeTab === 'defensive' ? 'active' : ''}`}
                onClick={() => setActiveTab('defensive')}
              >
                Defensive & DevSecOps
              </button>
              <button
                className={`feature-tab ${activeTab === 'learning' ? 'active' : ''}`}
                onClick={() => setActiveTab('learning')}
              >
                CTF & Learning
              </button>
            </div>
          </div>

          <div className="landing-features-grid">
            {filteredFeatures.map(f => (
              <article key={f.id} className="landing-feature-card">
                <div className="landing-feature-top">
                  <div className="landing-feature-icon">{f.icon}</div>
                  <span className="landing-feature-tag">{f.badge}</span>
                </div>
                <h3 className="landing-feature-title">{f.title}</h3>
                <p className="landing-feature-desc">{f.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section - 4 Steps Grid */}
      <section id="how-it-works" className="landing-section landing-section--alt">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="landing-section-kicker">
              <FiActivity size={13} /> Workflow
            </span>
            <h2 className="landing-section-title">From Query to Tactical Execution</h2>
            <p className="landing-section-subtitle">
              Get precise answers, executable code snippets, and remediation steps in seconds.
            </p>
          </div>

          <div className="landing-steps-grid">
            {[
              {
                step: '01',
                title: 'Input Artifact or Query',
                desc: 'Paste a CVE ID, log snippet, Wireshark packet capture, or target environment scenario.'
              },
              {
                step: '02',
                title: 'Deep AI Threat Analysis',
                desc: 'Cyber AI queries threat databases and vulnerability models to synthesize practical insights.'
              },
              {
                step: '03',
                title: 'Payload & Strategy Synthesis',
                desc: 'Receive verified CLI commands, exploit hints, SAST fix patches, or compliance mapping.'
              },
              {
                step: '04',
                title: 'Responsible Execution',
                desc: 'Execute safely within scope, enforce security controls, and document findings for compliance.'
              }
            ].map(s => (
              <div key={s.step} className="landing-step-card">
                <div className="landing-step-num">{s.step}</div>
                <h3 className="landing-step-title">{s.title}</h3>
                <p className="landing-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Grid / Pills */}
      <section id="use-cases" className="landing-section">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="landing-section-kicker">
              <FiUsers size={13} /> Versatility
            </span>
            <h2 className="landing-section-title">Designed for Every Domain in Cyber</h2>
            <p className="landing-section-subtitle">
              Explore specialized knowledge tailored across offensive, defensive, and compliance realms.
            </p>
          </div>

          <div className="landing-chips-wrapper">
            {[
              'Threat Intelligence', 'Penetration Testing', 'CTF Walkthroughs', 'Burp Suite Automation',
              'Secure Code Auditing', 'NIST / ISO 27001 Compliance', 'Incident Response (IR)',
              'Red Team / Blue Team', 'Cloud Hardening (AWS/GCP)', 'Applied Cryptography',
              'OSINT Investigations', 'Reverse Engineering', 'SAST & DAST Pipelines', 'Docker Sandbox Security'
            ].map(tag => (
              <span key={tag} className="landing-chip">
                <FiCheckSquare size={13} className="chip-check" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="landing-section landing-section--alt">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="landing-section-kicker">Questions</span>
            <h2 className="landing-section-title">Frequently Asked Questions</h2>
          </div>

          <div className="landing-faq-list">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={faq.q} className={`landing-faq-item ${isOpen ? 'open' : ''}`}>
                  <button
                    className="faq-question"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <FiChevronDown className={`faq-icon ${isOpen ? 'rotate' : ''}`} size={18} />
                  </button>
                  {isOpen && (
                    <div className="faq-answer">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="landing-cta-section">
        <div className="landing-container">
          <div className="landing-cta-card">
            <div className="cta-glow" aria-hidden="true" />
            <span className="landing-cta-badge">Ready to Start?</span>
            <h2 className="landing-cta-title">Elevate Your Security Operations Today</h2>
            <p className="landing-cta-subtitle">
              Join security professionals, analysts, and students mastering cybersecurity with Cyber AI.
            </p>
            <button className="landing-cta-btn" onClick={onGetStarted}>
              <span>Launch Workspace</span>
              <FiArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-grid">
            <div className="landing-footer-brand-col">
              <div className="landing-footer-brand">
                <div className="landing-logo" aria-hidden="true">
                  <FiShield size={18} />
                </div>
                <span className="landing-footer-title">Cyber AI</span>
              </div>
              <p className="landing-footer-desc">
                An advanced cybersecurity intelligence workspace built for defenders, researchers, and learners worldwide.
              </p>
            </div>

            <div className="landing-footer-links-col">
              <h4 className="landing-footer-heading">Navigation</h4>
              <a href="#features" className="footer-link">Features</a>
              <a href="#terminal" className="footer-link">Live Terminal</a>
              <a href="#how-it-works" className="footer-link">How it works</a>
              <a href="#faq" className="footer-link">FAQ</a>
            </div>

            <div className="landing-footer-links-col">
              <h4 className="landing-footer-heading">Legal & Ethics</h4>
              <p className="footer-text">Educational and authorized security assessment purposes only.</p>
              <p className="footer-text">Always hack ethically and responsibly.</p>
            </div>
          </div>

          <div className="landing-footer-bottom">
            <p>&copy; {new Date().getFullYear()} Cyber AI. Designed & Built by <strong>Saksham Shekher</strong>.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
