import { useState, useEffect } from 'react';
import type { AdminQuery } from './types.ts';

interface QueriesTabProps {
  accessToken: string;
}

const QUERY_PAGE_SIZE = 50;

export function QueriesTab({ accessToken }: QueriesTabProps) {
  const [queries, setQueries] = useState<AdminQuery[]>([]);
  const [loadingQueries, setLoadingQueries] = useState(false);
  const [querySearch, setQuerySearch] = useState('');
  const [debouncedQuerySearch, setDebouncedQuerySearch] = useState('');
  const [querySource, setQuerySource] = useState<'all' | 'primary' | 'brave'>('all');
  const [queryError, setQueryError] = useState<string | null>(null);
  const [queryPage, setQueryPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  // Debounce query search input by 300ms to reduce unnecessary API fetch requests on fast typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuerySearch(querySearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [querySearch]);

  // Load queries via async effect
  useEffect(() => {
    let ignore = false;

    async function fetchQueries() {
      setLoadingQueries(true);
      try {
        const params = new URLSearchParams();
        params.append('page', String(queryPage));
        params.append('perPage', String(QUERY_PAGE_SIZE));
        if (debouncedQuerySearch.trim()) params.append('q', debouncedQuerySearch.trim());
        if (querySource !== 'all') params.append('source', querySource);

        const response = await fetch(`/api/admin/queries?${params.toString()}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null) as { error?: string } | null;
          throw new Error(payload?.error ?? `Failed to load queries (${response.status}).`);
        }

        const payload = await response.json() as { queries: AdminQuery[] };
        if (!ignore) {
          setQueries(payload.queries);
          setQueryError(null);
        }
      } catch (err) {
        if (!ignore) {
          setQueryError(err instanceof Error ? err.message : 'Unable to load queries.');
        }
      } finally {
        if (!ignore) {
          setLoadingQueries(false);
        }
      }
    }

    void fetchQueries();
    return () => { ignore = true; };
  }, [accessToken, queryPage, debouncedQuerySearch, querySource, refreshKey]);

  return (
    <section className="adm-stats" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="adm-toolbar">
        <label className="adm-search">
          <span className="adm-search-label">Search Queries</span>
          <input
            type="search"
            value={querySearch}
            onChange={(event) => {
              setQuerySearch(event.target.value);
              setQueryPage(1);
            }}
            placeholder="Search query text or user..."
          />
        </label>

        <label className="adm-search">
          <span className="adm-search-label">Source</span>
          <select
            value={querySource}
            onChange={(e) => {
              setQuerySource(e.target.value as 'all' | 'primary' | 'brave');
              setQueryPage(1);
            }}
            className="adm-select"
          >
            <option value="all">All sources</option>
            <option value="primary">Primary API</option>
            <option value="brave">Brave fallback</option>
          </select>
        </label>

        <button
          className="adm-btn adm-btn--primary"
          onClick={() => {
            setLoadingQueries(true);
            setRefreshKey(k => k + 1);
          }}
          disabled={loadingQueries}
        >
          {loadingQueries ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {queryError && <div className="adm-error" role="alert">{queryError}</div>}

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Query</th>
              <th>Source</th>
              <th>Status</th>
              <th>Asked at</th>
            </tr>
          </thead>
          <tbody>
            {loadingQueries ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={`q-skeleton-${index}`} className="adm-skeleton-row">
                  <td data-label="User"><div className="adm-skeleton-cell adm-skeleton-cell--medium" /></td>
                  <td data-label="Query"><div className="adm-skeleton-cell adm-skeleton-cell--long" /></td>
                  <td data-label="Source"><div className="adm-skeleton-cell adm-skeleton-cell--short" /></td>
                  <td data-label="Status"><div className="adm-skeleton-cell adm-skeleton-cell--short" /></td>
                  <td data-label="Asked at"><div className="adm-skeleton-cell adm-skeleton-cell--medium" /></td>
                </tr>
              ))
            ) : queries.length === 0 ? (
              <tr>
                <td colSpan={5} className="adm-empty">No queries found.</td>
              </tr>
            ) : (
              queries.map((item) => (
                <tr key={item.id}>
                  <td data-label="User">
                    <div className="adm-user-cell">
                      <strong>{item.fullName ?? 'Anonymous'}</strong>
                      <span>{item.email ?? item.userId ?? 'Unknown'}</span>
                    </div>
                  </td>
                  <td data-label="Query" className="adm-query-cell">{item.query}</td>
                  <td data-label="Source">
                    <span className={`adm-badge adm-badge--${item.source}`}>
                      {item.source === 'primary' ? 'Primary' : 'Brave'}
                    </span>
                  </td>
                  <td data-label="Status">
                    <span className={`adm-badge adm-badge--${item.status}`}>{item.status}</span>
                  </td>
                  <td data-label="Asked at">{new Date(item.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="adm-pagination">
        <div className="adm-pagination-info">
          Showing {queries.length} quer{(queries.length === 1 ? 'y' : 'ies')}
          {querySearch.trim() || querySource !== 'all' ? ' (filtered)' : ''}
        </div>
        <div className="adm-pagination-controls">
          <button
            className="adm-pagination-btn"
            onClick={() => setQueryPage((p) => Math.max(1, p - 1))}
            disabled={queryPage === 1}
            aria-label="Previous page"
          >
            ←
          </button>
          <button
            className="adm-pagination-btn"
            onClick={() => setQueryPage((p) => p + 1)}
            disabled={queries.length < QUERY_PAGE_SIZE}
            aria-label="Next page"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
