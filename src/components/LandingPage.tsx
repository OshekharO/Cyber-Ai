import { useState, useEffect } from 'react';

export function LandingPage() {
  const [demoText, setDemoText] = useState('');
  const fullDemoText = "Hello! I'm your AI cybersecurity assistant. How can I help you today?";
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

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">🚀 AI-Powered Cybersecurity Platform</div>
          <h1 className="hero-title">
            Intelligent Security<br />
            <span className="gradient-text">Conversations</span>
          </h1>
          <p className="hero-subtitle">
            Transform your cybersecurity workflow with AI-powered chat assistance.
            Get instant answers, analyze threats, and learn security concepts through natural conversations.
          </p>
          <div className="hero-cta">
            <button 
              className="cta-button primary"
              onClick={() => window.location.href = '/chat'}
            >
              Try Now — It's Free →
            </button>
            <a href="#features" className="cta-button secondary">Learn More</a>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-value">24/7</div>
              <div className="stat-label">AI Support</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-value">100%</div>
              <div className="stat-label">Secure</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-value">Free</div>
              <div className="stat-label">To Start</div>
            </div>
          </div>
        </div>

        {/* Chat UI Preview */}
        <div className="chat-preview">
          <div className="chat-window">
            <div className="chat-header">
              <div className="chat-avatar">🛡️</div>
              <div className="chat-info">
                <div className="chat-name">Cyber AI Assistant</div>
                <div className="chat-status online">● Online</div>
              </div>
            </div>
            <div className="chat-messages">
              <div className="message user">
                <div className="message-bubble">
                  What security best practices should I follow?
                </div>
              </div>
              <div className="message bot">
                <div className="message-bubble">
                  {demoText}
                  {currentStep < fullDemoText.length && <span className="cursor">|</span>}
                </div>
              </div>
            </div>
            <div className="chat-input-preview">
              <div className="input-placeholder">Ask me anything about cybersecurity...</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <h2 className="section-title">Why Choose Cyber AI?</h2>
        <p className="section-subtitle">Powerful features designed for cybersecurity professionals and learners</p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Instant Responses</h3>
            <p>Get real-time answers to your cybersecurity questions with token-by-token streaming for natural conversation flow.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>Smart Context</h3>
            <p>Advanced memory system remembers your conversation history, preferences, and learning progress across sessions.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Enterprise Security</h3>
            <p>Built with security-first principles. Your data is encrypted and protected with industry-standard practices.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Educational Focus</h3>
            <p>Designed for cybersecurity education with curated knowledge base and guided learning paths.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Natural Conversations</h3>
            <p>Interact naturally with AI that understands cybersecurity terminology and complex technical concepts.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Modern Interface</h3>
            <p>Clean, intuitive design with dark/light themes optimized for long coding and learning sessions.</p>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="usecases-section">
        <h2 className="section-title">Perfect For</h2>
        <div className="usecases-grid">
          <div className="usecase-card">
            <div className="usecase-icon">👨‍💻</div>
            <h3>Students & Learners</h3>
            <p>Master cybersecurity concepts through interactive Q&A and guided explanations.</p>
          </div>
          <div className="usecase-card">
            <div className="usecase-icon">🔐</div>
            <h3>Security Professionals</h3>
            <p>Quick reference for best practices, threat analysis, and security frameworks.</p>
          </div>
          <div className="usecase-card">
            <div className="usecase-icon">🏢</div>
            <h3>Teams & Organizations</h3>
            <p>Collaborative learning and knowledge sharing for security teams.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Enhance Your Cybersecurity Knowledge?</h2>
          <p className="cta-subtitle">Join the community of cybersecurity enthusiasts learning with AI</p>
          <button 
            className="cta-button large"
            onClick={() => window.location.href = '/chat'}
          >
            Get Started Free →
          </button>
          <p className="cta-note">No credit card required • Instant access • Educational use</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">🛡️</div>
            <span className="footer-title">Cyber AI</span>
          </div>
          <p className="footer-text">
            Built with ❤️ for the cybersecurity community by Saksham Shekher and Ayan Kar
          </p>
          <p className="footer-copyright">© 2026 Cyber AI Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
