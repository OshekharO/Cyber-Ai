import { FiZap, FiArrowRight, FiTerminal, FiCheckCircle, FiShield, FiCpu, FiPlay, FiCheck, FiCopy } from 'react-icons/fi';
import { TERMINAL_PRESETS } from './data';

interface LandingHeroProps {
  activePresetId: string;
  setActivePresetId: (id: string) => void;
  copiedTerminal: boolean;
  handleCopyTerminal: () => void;
  onGetStarted: () => void;
}

export function LandingHero({
  activePresetId,
  setActivePresetId,
  copiedTerminal,
  handleCopyTerminal,
  onGetStarted,
}: LandingHeroProps) {
  const currentPreset = TERMINAL_PRESETS.find(p => p.id === activePresetId) || TERMINAL_PRESETS[0];

  return (
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
              {TERMINAL_PRESETS.map(preset => (
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
  );
}
