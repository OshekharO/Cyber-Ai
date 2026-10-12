import { FiActivity } from 'react-icons/fi';
import { WORKFLOW_STEPS } from './data';

export function LandingWorkflow() {
  return (
    <section id="how-it-works" className="landing-section landing-section--alt">
      <div className="landing-container">
        <div className="landing-section-header">
          <span className="landing-section-kicker">
            <FiActivity size={13} /> Workflow
          </span>
          <h2 className="landing-section-title">From Query to Tactical Execution</h2>
          <p className="landing-section-subtitle">
            Get precise answers, executable code snippets, and remediation steps in seconds.
          </p>
        </div>

        <div className="landing-steps-grid">
          {WORKFLOW_STEPS.map(s => (
            <div key={s.step} className="landing-step-card">
              <div className="landing-step-num">{s.step}</div>
              <h3 className="landing-step-title">{s.title}</h3>
              <p className="landing-step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
