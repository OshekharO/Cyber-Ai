import { useState } from 'react';
import { FaShieldAlt, FaRobot, FaLock, FaChartLine, FaUsers, FaCode } from 'react-icons/fa';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  const features = [
    {
      icon: <FaRobot className="feature-icon" />,
      title: 'AI-Powered Security',
      description: 'Advanced AI algorithms analyze threats in real-time and provide intelligent security recommendations.',
    },
    {
      icon: <FaShieldAlt className="feature-icon" />,
      title: 'Threat Detection',
      description: 'Proactively identify and mitigate security vulnerabilities before they become critical issues.',
    },
    {
      icon: <FaLock className="feature-icon" />,
      title: 'Secure Communication',
      description: 'End-to-end encrypted chat workspace for secure collaboration among cybersecurity professionals.',
    },
    {
      icon: <FaChartLine className="feature-icon" />,
      title: 'Analytics Dashboard',
      description: 'Comprehensive analytics and insights to track security metrics and improve your defense strategy.',
    },
  ];

  const useCases = [
    {
      icon: <FaUsers className="usecase-icon" />,
      title: 'Security Teams',
      description: 'Collaborate securely with your team on threat analysis and incident response.',
    },
    {
      icon: <FaCode className="usecase-icon" />,
      title: 'Developers',
      description: 'Get AI-assisted code review and security best practices for your applications.',
    },
    {
      icon: <FaShieldAlt className="usecase-icon" />,
      title: 'Students & Enthusiasts',
      description: 'Learn cybersecurity concepts through interactive AI-powered guidance.',
    },
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">🛡️ Educational Cybersecurity Platform</div>
          <h1 className="hero-title">
            Cyber AI
            <span className="hero-subtitle">Intelligent Security Assistant</span>
          </h1>
          <p className="hero-description">
            Empower your cybersecurity journey with AI-driven insights, secure collaboration tools,
            and real-time threat intelligence. Built for professionals, students, and enthusiasts.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={onGetStarted}>
              Get Started Free
            </button>
            <a href="#features" className="btn-secondary">
              Learn More
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">AI Support</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Encrypted</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">Free</span>
              <span className="stat-label">To Start</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="orb-container">
            <div className="orb orb-1"></div>
            <div className="orb orb-2"></div>
            <div className="orb orb-3"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Powerful Features</h2>
          <p>Everything you need to enhance your cybersecurity workflow</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`feature-card ${activeFeature === index ? 'active' : ''}`}
              onMouseEnter={() => setActiveFeature(index)}
              onMouseLeave={() => setActiveFeature(null)}
            >
              <div className="feature-icon-wrapper">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="usecases-section">
        <div className="section-header">
          <h2>Built For Everyone</h2>
          <p>Whether you're a professional or just starting out</p>
        </div>
        <div className="usecases-grid">
          {useCases.map((useCase, index) => (
            <div key={index} className="usecase-card">
              <div className="usecase-icon-wrapper">{useCase.icon}</div>
              <h3>{useCase.title}</h3>
              <p>{useCase.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Enhance Your Security?</h2>
          <p>Join thousands of cybersecurity professionals using Cyber AI</p>
          <button className="btn-primary btn-large" onClick={onGetStarted}>
            Start Free Today
          </button>
          <p className="cta-note">No credit card required • Free forever plan available</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">🛡️ Cyber AI</span>
            <p>Educational cybersecurity platform built with ❤️ for the community</p>
          </div>
          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onGetStarted(); }}>Get Started</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Cyber AI. Built by Saksham Shekher and Ayan Kar.</p>
        </div>
      </footer>
    </div>
  );
}
