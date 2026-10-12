import { FiShield } from 'react-icons/fi';
import { SocialIcon } from 'react-social-icons';

export function LandingFooter() {
  return (
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
            <a href="#featured" className="footer-link">Featured On</a>
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
          <div className="landing-footer-socials">
            <SocialIcon url="https://github.com/OshekharO" target="_blank" rel="noopener noreferrer" style={{ width: 32, height: 32 }} bgColor="#1e293b" fgColor="#94a3b8" />
            <SocialIcon url="https://x.com/OshekharO" target="_blank" rel="noopener noreferrer" style={{ width: 32, height: 32 }} bgColor="#1e293b" fgColor="#94a3b8" />
            <SocialIcon url="https://www.instagram.com/oshekhero/" target="_blank" rel="noopener noreferrer" style={{ width: 32, height: 32 }} bgColor="#1e293b" fgColor="#94a3b8" />
            <SocialIcon url="https://t.me/duskdrifter/" target="_blank" rel="noopener noreferrer" style={{ width: 32, height: 32 }} bgColor="#1e293b" fgColor="#94a3b8" />
            <SocialIcon url="mailto:me@saksham.eu.org" target="_blank" rel="noopener noreferrer" style={{ width: 32, height: 32 }} bgColor="#1e293b" fgColor="#94a3b8" />
            <SocialIcon url="https://www.linkedin.com/in/oshekher/" target="_blank" rel="noopener noreferrer" style={{ width: 32, height: 32 }} bgColor="#1e293b" fgColor="#94a3b8" />
            <SocialIcon url="https://www.reddit.com/user/oshekher/" target="_blank" rel="noopener noreferrer" style={{ width: 32, height: 32 }} bgColor="#1e293b" fgColor="#94a3b8" />
          </div>
        </div>
      </div>
    </footer>
  );
}
