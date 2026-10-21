import { useState, useEffect } from 'react';
import type { AdminAuditLog } from './types.ts';

interface AuditTabProps {
  accessToken: string;
}

const AUDIT_PAGE_SIZE = 50;

export function AuditTab({ accessToken }: AuditTabProps) {
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditPage, setAuditPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load audit logs via async effect
  useEffect(() => {
    let ignore = false;

    async function fetchAuditLogs() {
      setLoadingAudit(true);
      try {
        const params = new URLSearchParams();
        params.append('page', String(auditPage));
        params.append('perPage', String(AUDIT_PAGE_SIZE));

        const response = await fetch(`/api/admin/audit?${params.toString()}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null) as { error?: string } | null;
          throw new Error(payload?.error ?? `Failed to load audit log (${response.status}).`);
        }

        const payload = await response.json() as { logs: AdminAuditLog[] };
        if (!ignore) {
          setAuditLogs(payload.logs);
          setAuditError(null);
        }
      } catch (err) {
        if (!ignore) {
          setAuditError(err instanceof Error ? err.message : 'Unable to load audit log.');
        }
      } finally {
        if (!ignore) {
          setLoadingAudit(false);
        }
      }
    }

    void fetchAuditLogs();
    return () => { ignore = true; };
  }, [accessToken, auditPage, refreshKey]);

  return (
    <section className="adm-stats" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="adm-toolbar">
        <button
          className="adm-btn adm-btn--primary"
          onClick={() => {
            setLoadingAudit(true);
            setRefreshKey(k => k + 1);
          }}
          disabled={loadingAudit}
        >
          {loadingAudit ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {auditError && <div className="adm-error" role="alert">{auditError}</div>}

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Admin</th>
              <th>Action</th>
              <th>Target User</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {loadingAudit ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={`audit-skeleton-${index}`} className="adm-skeleton-row">
                  <td data-label="When"><div className="adm-skeleton-cell adm-skeleton-cell--medium" /></td>
                  <td data-label="Admin"><div className="adm-skeleton-cell adm-skeleton-cell--medium" /></td>
                  <td data-label="Action"><div className="adm-skeleton-cell adm-skeleton-cell--short" /></td>
                  <td data-label="Target User"><div className="adm-skeleton-cell adm-skeleton-cell--medium" /></td>
                  <td data-label="Details"><div className="adm-skeleton-cell adm-skeleton-cell--long" /></td>
                </tr>
              ))
            ) : auditLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="adm-empty">No audit log entries found.</td>
              </tr>
            ) : (
              auditLogs.map((item) => (
                <tr key={item.id}>
                  <td data-label="When">{new Date(item.createdAt).toLocaleString()}</td>
                  <td data-label="Admin">
                    <div className="adm-user-cell">
                      <strong>{item.adminName ?? 'Unknown'}</strong>
                      <span>{item.adminEmail ?? item.adminId}</span>
                    </div>
                  </td>
                  <td data-label="Action">
                    <span className={`adm-badge adm-badge--${item.action === 'update_role' ? 'primary' : item.action === 'delete_user' ? 'error' : 'success'}`}>
                      {item.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td data-label="Target User">
                    <div className="adm-user-cell">
                      <strong>{item.targetName ?? 'Unknown'}</strong>
                      <span>{item.targetEmail ?? item.targetUserId}</span>
                    </div>
                  </td>
                  <td data-label="Details" className="adm-query-cell">
                    {item.details && Object.keys(item.details).length > 0
                      ? JSON.stringify(item.details)
                      : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="adm-pagination">
        <div className="adm-pagination-info">
          Showing {auditLogs.length} entr{(auditLogs.length === 1 ? 'y' : 'ies')}
        </div>
        <div className="adm-pagination-controls">
          <button
            className="adm-pagination-btn"
            onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
            disabled={auditPage === 1}
            aria-label="Previous page"
          >
            ←
          </button>
          <button
            className="adm-pagination-btn"
            onClick={() => setAuditPage((p) => p + 1)}
            disabled={auditLogs.length < AUDIT_PAGE_SIZE}
            aria-label="Next page"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
