import type { CveResponse } from '../api/cve.ts';

interface CveCardProps {
  data: CveResponse;
  theme: 'dark' | 'light';
}

export function CveCard({ data, theme }: CveCardProps) {
  const description = data.descriptions.find(d => d.lang === 'en') ?? data.descriptions[0];
  const primaryCvss = data.metrics.cvssMetricV31?.[0]?.cvssData ?? data.metrics.cvssMetricV2?.[0]?.cvssData;
  const severity = primaryCvss?.baseSeverity ?? 'UNKNOWN';
  const score = primaryCvss?.baseScore ?? 'N/A';
  const severityColor = severity === 'HIGH' || severity === 'CRITICAL'
    ? '#ef4444'
    : severity === 'MEDIUM'
      ? '#f59e0b'
      : '#22c55e';

  return (
    <div className={`cve-card cve-card--${theme}`}>
      <div className="cve-card-header">
        <div className="cve-card-title">
          <span className="cve-id">{data.id}</span>
          {primaryCvss && (
            <span className="cve-cvss-pill" style={{ '--severity-color': severityColor } as Record<string, string>}>
              CVSS {score} <span className="cve-severity">{severity}</span>
            </span>
          )}
        </div>
        <span className="cve-date">Published {new Date(data.published).toLocaleDateString()}</span>
      </div>

      {description && <p className="cve-desc">{description.value}</p>}

      <div className="cve-grid">
        <div className="cve-block">
          <h4>Affected</h4>
          {data.affected.map((a, i) => (
            <p key={i} className="cve-text">{a.vendor} — {a.product}</p>
          ))}
        </div>

        {primaryCvss && (
          <div className="cve-block">
            <h4>CVSS {primaryCvss.version}</h4>
            <p className="cve-text">Vector: {primaryCvss.vectorString}</p>
            {primaryCvss.exploitabilityScore && (
              <p className="cve-text">Exploitability: {primaryCvss.exploitabilityScore} | Impact: {primaryCvss.impactScore ?? 'N/A'}</p>
            )}
          </div>
        )}

        {data.weaknesses.length > 0 && (
          <div className="cve-block">
            <h4>CWE</h4>
            {data.weaknesses.map((w, i) => (
              <p key={i} className="cve-text">{w.description.map(d => d.value).join(', ')}</p>
            ))}
          </div>
        )}

        {data.references.length > 0 && (
          <div className="cve-block">
            <h4>References</h4>
            {data.references.slice(0, 5).map((ref, i) => (
              <a key={i} href={ref.url} target="_blank" rel="noreferrer" className="cve-link">
                {ref.source} {ref.tags[0] && <span className="cve-tag">{ref.tags[0]}</span>}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
