import { useState, useEffect } from 'react';

export function LandingPage() {
  const [demoText, setDemoText] = useState('');
  const fullDemoText = "Hello! I'm your AI assistant. How can I help you today?";
  const [currentStep, setCurrentStep] = useState(0);

  // Streaming text animation
  useEffect(() => {
    if (currentStep < fullDemoText.length) {
      const timer = setTimeout(() => {
        setDemoText(fullDemoText.slice(0, currentStep + 1));
        setCurrentStep(currentStep + 1);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Build Intelligent<br />
            <span className="gradient-text">Conversations</span>
          </h1>
          <p className="hero-subtitle">
            A modern AI chatbot platform with real-time streaming, smart context management,
            and seamless integrations.
          </p>
          <button 
            className="cta-button primary"
            onClick={() => window.location.href = '/chat'}
          >
            Try Now →
          </button>
        </div>

        {/* Chat UI Preview */}
        <div className="chat-preview">
          <div className="chat-window">
            <div className="chat-header">
              <div className="chat-avatar">🤖</div>
              <div className="chat-info">
                <div className="chat-name">AI Assistant</div>
                <div className="chat-status online">● Online</div>
              </div>
            </div>
            <div className="chat-messages">
              <div className="message user">
                <div className="message-bubble">
                  What can you help me with?
                </div>
              </div>
              <div className="message bot">
                <div className="message-bubble">
                  {demoText}
                  {currentStep < fullDemoText.length && <span className="cursor">|</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <h2 className="section-title">Powerful AI Capabilities</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Real-time Streaming</h3>
            <p>Instant responses with token-by-token streaming for natural conversation flow.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>Smart Context</h3>
            <p>Advanced memory system that remembers conversation history and preferences.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>Enterprise-grade security with end-to-end encryption and data privacy controls.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Customizable UI</h3>
            <p>Fully themeable interface with dark/light modes and custom branding options.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Analytics Dashboard</h3>
            <p>Track usage, monitor performance, and gain insights into user interactions.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Multi-language</h3>
            <p>Support for 50+ languages with automatic detection and translation.</p>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="integrations-section">
        <h2 className="section-title">Seamless Integrations</h2>
        <p className="section-subtitle">Connect with your favorite tools and platforms</p>
        <div className="integration-logos">
          <div className="integration-item">Slack</div>
          <div className="integration-item">Discord</div>
          <div className="integration-item">Teams</div>
          <div className="integration-item">WhatsApp</div>
          <div className="integration-item">Telegram</div>
          <div className="integration-item">API</div>
          <div className="integration-item">Webhooks</div>
          <div className="integration-item">Zapier</div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2 className="cta-title">Ready to Get Started?</h2>
        <p className="cta-subtitle">Join thousands of users building intelligent conversations</p>
        <button 
          className="cta-button large"
          onClick={() => window.location.href = '/chat'}
        >
          Try Now — It's Free
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 Cyber AI Platform. Built with ❤️</p>
      </footer>
    </div>
  );
}
