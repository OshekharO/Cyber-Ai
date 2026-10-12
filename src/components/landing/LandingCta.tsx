import { FiArrowRight } from 'react-icons/fi';

interface LandingCtaProps {
  onGetStarted: () => void;
}

export function LandingCta({ onGetStarted }: LandingCtaProps) {
  return (
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
  );
}
