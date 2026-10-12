import { FiUsers, FiCheckSquare } from 'react-icons/fi';
import { USE_CASE_CHIPS } from './data';

export function LandingUseCases() {
  return (
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
          {USE_CASE_CHIPS.map(tag => (
            <span key={tag} className="landing-chip">
              <FiCheckSquare size={13} className="chip-check" />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
