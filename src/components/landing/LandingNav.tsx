import { FiShield, FiX, FiMenu, FiArrowRight } from 'react-icons/fi';

interface LandingNavProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  onGetStarted: () => void;
}

export function LandingNav({ menuOpen, setMenuOpen, onGetStarted }: LandingNavProps) {
  return (
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
          <a href="#featured" className="landing-nav-link" onClick={() => setMenuOpen(false)}>Featured On</a>
          <a href="#how-it-works" className="landing-nav-link" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="#use-cases" className="landing-nav-link" onClick={() => setMenuOpen(false)}>Use cases</a>
          <a href="#faq" className="landing-nav-link" onClick={() => setMenuOpen(false)}>FAQ</a>
          <button className="landing-nav-cta" onClick={() => { setMenuOpen(false); onGetStarted(); }}>
            Launch Workspace <FiArrowRight size={15} />
          </button>
        </div>
      </div>
    </nav>
  );
}
