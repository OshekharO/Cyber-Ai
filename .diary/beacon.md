## 2026-09-10 - Single-Page Application (SPA) Meta and Structured Data Foundation

**Learning:** Single Page Applications (SPAs) built with Vite and React served via client-side routing still rely on static `index.html` parsing for social share crawlers (Open Graph / Twitter Cards) and search engine bot initial indexing. Having complete JSON-LD structured data (`WebApplication` and `Organization`), self-referencing canonical links, and synced `robots.txt`/`sitemap.xml` in `public/` ensures full indexability and rich search result qualification without requiring server-side rendering (SSR) infrastructure.

**Action:** Always ensure SPAs include static Open Graph meta tags, canonical link, JSON-LD structured data, and valid `robots.txt` + `sitemap.xml` referencing the primary production domain.
