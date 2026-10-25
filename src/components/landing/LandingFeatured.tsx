export function LandingFeatured() {
  return (
    <section id="featured" className="landing-featured">
      <div className="landing-container">
        <div className="landing-featured-inner">
          <span className="landing-featured-label">Featured On</span>
          <div className="landing-featured-badges">
            <a
              href="https://peerlist.io/oshekharo/project/cyber-ai--cybersecurity-assistant"
              target="_blank"
              rel="noopener noreferrer"
              className="landing-badge-link"
              title="Featured on Peerlist"
            >
              <img
                src="https://dqy38fnwh4fqs.cloudfront.net/website/peerlist-logo-full-light.svg"
                alt="Featured on Peerlist"
                className="landing-badge-img landing-badge-img--light"
              />
              <img
                src="https://dqy38fnwh4fqs.cloudfront.net/website/peerlist-logo-full-dark.svg"
                alt="Featured on Peerlist"
                className="landing-badge-img landing-badge-img--dark"
              />
            </a>

            <a
              href="https://reporanker.com/repos/OshekharO/Cyber-Ai"
              target="_blank"
              rel="noopener noreferrer"
              className="landing-badge-link"
              title="Featured on RepoRanker"
            >
              <img
                src="https://reporanker.com/peerlist-badge.svg"
                alt="Featured on RepoRanker"
                className="landing-badge-img landing-badge-img--light"
              />
              <img
                src="https://reporanker.com/peerlist-badge.svg"
                alt="Featured on RepoRanker"
                className="landing-badge-img landing-badge-img--dark"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
