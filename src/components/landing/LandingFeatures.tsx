import { FiLayers } from 'react-icons/fi';
import { FEATURES } from './data';

interface LandingFeaturesProps {
  activeTab: 'all' | 'offensive' | 'defensive' | 'learning';
  setActiveTab: (tab: 'all' | 'offensive' | 'defensive' | 'learning') => void;
}

export function LandingFeatures({ activeTab, setActiveTab }: LandingFeaturesProps) {
  const filteredFeatures = activeTab === 'all'
    ? FEATURES
    : FEATURES.filter(f => f.category === activeTab);

  return (
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
  );
}
