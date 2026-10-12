import { FiChevronDown } from 'react-icons/fi';
import { FAQS } from './data';

interface LandingFaqProps {
  openFaqIndex: number | null;
  toggleFaq: (index: number) => void;
}

export function LandingFaq({ openFaqIndex, toggleFaq }: LandingFaqProps) {
  return (
    <section id="faq" className="landing-section landing-section--alt">
      <div className="landing-container">
        <div className="landing-section-header">
          <span className="landing-section-kicker">Questions</span>
          <h2 className="landing-section-title">Frequently Asked Questions</h2>
        </div>

        <div className="landing-faq-list">
          {FAQS.map((faq, index) => {
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
  );
}
