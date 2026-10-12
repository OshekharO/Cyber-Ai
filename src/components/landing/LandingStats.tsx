import { STATS } from './data';

export function LandingStats() {
  return (
    <section className="landing-stats">
      <div className="landing-container">
        <div className="landing-stats-grid">
          {STATS.map(stat => (
            <div key={stat.label} className="landing-stat-card">
              <span className="landing-stat-value">{stat.value}</span>
              <span className="landing-stat-label">{stat.label}</span>
              <span className="landing-stat-detail">{stat.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
