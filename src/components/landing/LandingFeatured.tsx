export function LandingFeatured() {
  return (
    <section id="featured" className="landing-featured">
      <div className="landing-container">
        <div className="landing-featured-inner">
          <span className="landing-featured-label">Featured On</span>
          <div className="landing-featured-badges">
            <a
              href="https://ailaun.ch/projects/cyber-ai?utm_source=badge"
              target="_blank"
              rel="noopener noreferrer"
              className="landing-badge-link"
              title="Featured on AI Launch"
            >
              <img
                src="https://ailaun.ch/ailaunch/images/badges/featured-on-light.svg"
                alt="Featured on AI Launch"
                className="landing-badge-img landing-badge-img--light"
              />
              <img
                src="https://ailaun.ch/ailaunch/images/badges/featured-on-dark.svg"
                alt="Featured on AI Launch"
                className="landing-badge-img landing-badge-img--dark"
              />
            </a>

            <a
              href="https://smollist.com/projects/cyber-ai?utm_source=badge"
              target="_blank"
              rel="noopener noreferrer"
              className="landing-badge-link"
              title="Featured on Smol List"
            >
              <img
                src="https://smollist.com/smollist/images/badges/featured-on-light.svg"
                alt="Featured on Smol List"
                className="landing-badge-img landing-badge-img--light"
              />
              <img
                src="https://smollist.com/smollist/images/badges/featured-on-dark.svg"
                alt="Featured on Smol List"
                className="landing-badge-img landing-badge-img--dark"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
