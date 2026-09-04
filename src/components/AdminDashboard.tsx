import { useEffect, useMemo, useState, useCallback } from 'react';
import type { Profile } from '../hooks/useAuth.ts';
import './AdminDashboard.css';

interface AdminDashboardProps {
  session: { access_token: string };
  profile: Profile;
  onBackToChat: () => void;
  onSignOut: () => void;
  notice?: string | null;
}

interface AdminUser {
  id: string;
  email: string | null;
  full_name: string | null;
  role: 'user' | 'admin';
  created_at: string;
  last_sign_in_at: string | null;
  confirmed_at: string | null;
}

interface AdminQuery {
  id: string;
  userId: string | null;
  email: string | null;
  fullName: string | null;
  query: string;
  source: 'primary' | 'brave';
  status: 'success' | 'error' | 'cancelled';
  sessionId: string | null;
  createdAt: string;
}

interface AdminAuditLog {
  id: string;
  adminId: string;
  adminEmail: string | null;
  adminName: string | null;
  action: string;
  targetUserId: string;
  targetEmail: string | null;
  targetName: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}

type AdminTab = 'users' | 'queries' | 'audit';

const PAGE_SIZE = 5;
const AUDIT_PAGE_SIZE = 50;

export function AdminDashboard({ session, profile, onBackToChat, onSignOut, notice }: AdminDashboardProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error'; message: string }>>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [tab, setTab] = useState<AdminTab>('users');
  const [queries, setQueries] = useState<AdminQuery[]>([]);
  const [loadingQueries, setLoadingQueries] = useState(false);
  const [querySearch, setQuerySearch] = useState('');
  const [querySource, setQuerySource] = useState<'all' | 'primary' | 'brave'>('all');
  const [queryError, setQueryError] = useState<string | null>(null);
  const [queryPage, setQueryPage] = useState(1);
  const [queryTotalPages, setQueryTotalPages] = useState(1);

  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditPage, setAuditPage] = useState(1);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error ?? `Failed to load users (${response.status}).`);
      }

      const payload = await response.json() as { users: AdminUser[] };
      setUsers(payload.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [session.access_token]);

  const loadQueries = useCallback(async () => {
    setLoadingQueries(true);
    setQueryError(null);

    try {
      const params = new URLSearchParams({
        page: '1',
        perPage: '200',
      });
      if (querySearch.trim()) params.set('q', querySearch.trim());
      if (querySource !== 'all') params.set('source', querySource);

      const response = await fetch(`/api/admin/queries?${params.toString()}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error ?? `Failed to load queries (${response.status}).`);
      }

      const payload = await response.json() as { queries: AdminQuery[] };
      setQueries(payload.queries);
      setQueryTotalPages(Math.max(1, Math.ceil(payload.queries.length / PAGE_SIZE)));
    } catch (err) {
      setQueryError(err instanceof Error ? err.message : 'Unable to load queries.');
    } finally {
      setLoadingQueries(false);
    }
  }, [session.access_token, querySearch, querySource]);

  useEffect(() => {
    setQueryPage(1);
    setQueryTotalPages(1);
  }, [querySearch, querySource]);

  useEffect(() => {
    if (tab === 'queries') {
      void loadQueries();
    }
  }, [tab, loadQueries]);

  const loadAuditLogs = useCallback(async () => {
    setLoadingAudit(true);
    setAuditError(null);

    try {
      const params = new URLSearchParams({
        page: String(auditPage),
        perPage: String(AUDIT_PAGE_SIZE),
      });

      const response = await fetch(`/api/admin/audit?${params.toString()}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error ?? `Failed to load audit log (${response.status}).`);
      }

      const payload = await response.json() as { logs: AdminAuditLog[] };
      setAuditLogs(payload.logs);
    } catch (err) {
      setAuditError(err instanceof Error ? err.message : 'Unable to load audit log.');
    } finally {
      setLoadingAudit(false);
    }
  }, [session.access_token, auditPage]);

  useEffect(() => {
    if (tab === 'audit') {
      void loadAuditLogs();
    }
  }, [tab, loadAuditLogs]);

  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return users;
    return users.filter(user =>
      [user.email, user.full_name, user.role].some(value => value?.toLowerCase().includes(needle))
    );
  }, [query, users]);

  const stats = useMemo(() => {
    const adminCount = users.filter(user => user.role === 'admin').length;
    return { total: users.length, admins: adminCount, users: users.length - adminCount };
  }, [users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, currentPage]);

  const filteredQueries = useMemo(() => {
    const needle = querySearch.trim().toLowerCase();
    if (!needle && querySource === 'all') return queries;
    return queries.filter(item => {
      const matchesSearch = !needle || [item.query, item.email, item.fullName, item.userId].some(value => value?.toLowerCase().includes(needle));
      const matchesSource = querySource === 'all' || item.source === querySource;
      return matchesSearch && matchesSource;
    });
  }, [queries, querySearch, querySource]);

  const paginatedQueries = useMemo(() => {
    const start = (queryPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredQueries.slice(start, end);
  }, [filteredQueries, queryPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const updateRole = async (userId: string, role: 'user' | 'admin') => {
    setSavingId(userId);
    setError(null);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId, role }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error ?? `Failed to update user (${response.status}).`);
      }

      await loadUsers();
      showToast('success', `User role updated to ${role} successfully.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to update user.';
      setError(msg);
      showToast('error', msg);
    } finally {
      setSavingId(null);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm('Delete this user account permanently?')) return;

    setSavingId(userId);
    setError(null);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error ?? `Failed to delete user (${response.status}).`);
      }

      await loadUsers();
      showToast('success', 'User deleted successfully.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to delete user.';
      setError(msg);
      showToast('error', msg);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="adm">
      <header className="adm-header">
        <div className="adm-header-inner">
          <div className="adm-brand">
            <p className="adm-kicker">Admin Dashboard</p>
            <h1 className="adm-title">Manage Users and Roles</h1>
            <p className="adm-subtitle">Signed in as {profile.full_name ?? profile.email ?? 'admin'}.</p>
          </div>

          <div className="adm-actions">
            <button className="adm-btn adm-btn--secondary" onClick={onBackToChat}>Back to chat</button>
            <button className="adm-btn adm-btn--secondary" onClick={onSignOut}>Sign out</button>
          </div>
        </div>
      </header>

      {notice && <div className="adm-notice">{notice}</div>}
      {error && <div className="adm-error" role="alert">{error}</div>}

      <nav className="adm-tabs">
        <div className="adm-tabs-inner">
          <button
            className={`adm-tab ${tab === 'users' ? 'adm-tab--active' : ''}`}
            onClick={() => setTab('users')}
          >
            Users
          </button>
          <button
            className={`adm-tab ${tab === 'queries' ? 'adm-tab--active' : ''}`}
            onClick={() => setTab('queries')}
          >
            User Queries
          </button>
          <button
            className={`adm-tab ${tab === 'audit' ? 'adm-tab--active' : ''}`}
            onClick={() => setTab('audit')}
          >
            Audit Log
          </button>
        </div>
      </nav>

      <main className="adm-body">
        <div className="adm-inner">
          {tab === 'users' && (
            <>
              <section className="adm-stats">
                <article className="adm-stat-card">
                  <span>Total users</span>
                  <strong>{stats.total}</strong>
                </article>
                <article className="adm-stat-card">
                  <span>Admins</span>
                  <strong>{stats.admins}</strong>
                </article>
                <article className="adm-stat-card">
                  <span>Regular users</span>
                  <strong>{stats.users}</strong>
                </article>
              </section>

              <div className="adm-toolbar">
                <label className="adm-search">
                  <span className="adm-search-label">Search</span>
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Email, name, role"
                  />
                </label>

                <button
                  className="adm-btn adm-btn--primary"
                  onClick={() => void loadUsers()}
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created</th>
                      <th>Last sign in</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={`skeleton-${index}`} className="adm-skeleton-row">
                          <td data-label="User"><div className="adm-skeleton-cell adm-skeleton-cell--long" /></td>
                          <td data-label="Email"><div className="adm-skeleton-cell adm-skeleton-cell--medium" /></td>
                          <td data-label="Role"><div className="adm-skeleton-cell adm-skeleton-cell--short" /></td>
                          <td data-label="Created"><div className="adm-skeleton-cell adm-skeleton-cell--medium" /></td>
                          <td data-label="Last sign in"><div className="adm-skeleton-cell adm-skeleton-cell--medium" /></td>
                          <td data-label="Actions"><div className="adm-skeleton-cell adm-skeleton-cell--short" /></td>
                        </tr>
                      ))
                    ) : paginatedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="adm-empty">No users found.</td>
                      </tr>
                    ) : (
                      paginatedUsers.map(user => (
                        <tr key={user.id}>
                          <td data-label="User">
                            <div className="adm-user-cell">
                              <strong>{user.full_name ?? 'Unnamed user'}</strong>
                              <span>{user.id}</span>
                            </div>
                          </td>
                          <td data-label="Email">{user.email ?? 'No email'}</td>
                          <td data-label="Role">
                            <select
                              className="adm-role-select"
                              value={user.role}
                              onChange={(event) => void updateRole(user.id, event.target.value as 'user' | 'admin')}
                              disabled={savingId === user.id}
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td data-label="Created">{new Date(user.created_at).toLocaleDateString()}</td>
                          <td data-label="Last sign in">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}</td>
                          <td data-label="Actions">
                            <button
                              className="adm-btn adm-btn--danger"
                              onClick={() => void deleteUser(user.id)}
                              disabled={savingId === user.id}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {!loading && filteredUsers.length > 0 && (
              {!loadingQueries && filteredQueries.length > 0 && (
                <div className="adm-pagination">
                  <div className="adm-pagination-info">
                    Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length} users
                  </div>
                  <div className="adm-pagination-controls">
                    <button
                      className="adm-pagination-btn"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      aria-label="Previous page"
                    >
                      ←
                    </button>
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const page = idx + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            className={`adm-pagination-btn ${page === currentPage ? 'adm-pagination-btn--active' : ''}`}
                            onClick={() => setCurrentPage(page)}
                            aria-label={`Go to page ${page}`}
                            aria-current={page === currentPage ? 'page' : undefined}
                          >
                            {page}
                          </button>
                        );
                      }
                      if (page === 2 || page === totalPages - 1) {
                        return <span key={page} className="adm-pagination-ellipsis">…</span>;
                      }
                      return null;
                    })}
                    <button
                      className="adm-pagination-btn"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      aria-label="Next page"
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {tab === 'queries' && (
            <section className="adm-stats" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="adm-toolbar">
                <label className="adm-search">
                  <span className="adm-search-label">Search</span>
                  <input
                    type="search"
                    value={querySearch}
                    onChange={(event) => setQuerySearch(event.target.value)}
                    placeholder="Search queries"
                  />
                </label>

                <label className="adm-search">
                  <span className="adm-search-label">Source</span>
                  <select
                    value={querySource}
                    onChange={(event) => setQuerySource(event.target.value as 'all' | 'primary' | 'brave')}
                  >
                    <option value="all">All</option>
                    <option value="primary">Primary API</option>
                    <option value="brave">Brave fallback</option>
                  </select>
                </label>

                <button
                  className="adm-btn adm-btn--primary"
                  onClick={() => void loadQueries()}
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
                     ) : paginatedQueries.length === 0 ? (
                       <tr>
                         <td colSpan={5} className="adm-empty">No queries found.</td>
                       </tr>
                     ) : (
                       paginatedQueries.map((item) => (
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

              {!loadingQueries && filteredQueries.length > 0 && (
                <div className="adm-pagination">
                  <div className="adm-pagination-info">
                    Showing {((queryPage - 1) * PAGE_SIZE) + 1}–{Math.min(queryPage * PAGE_SIZE, filteredQueries.length)} of {filteredQueries.length} queries
                  </div>
                  <div className="adm-pagination-controls">
                  <button
                    className="adm-pagination-btn"
                    onClick={() => setQueryPage(p => Math.max(1, p - 1))}
                    disabled={queryPage === 1}
                    aria-label="Previous page"
                  >
                    ←
                  </button>
                  {Array.from({ length: queryTotalPages }).map((_, idx) => {
                    const page = idx + 1;
                    if (
                      page === 1 ||
                      page === queryTotalPages ||
                      (page >= queryPage - 1 && page <= queryPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          className={`adm-pagination-btn ${page === queryPage ? 'adm-pagination-btn--active' : ''}`}
                          onClick={() => setQueryPage(page)}
                          aria-label={`Go to page ${page}`}
                          aria-current={page === queryPage ? 'page' : undefined}
                        >
                          {page}
                        </button>
                      );
                    }
                    if (page === 2 || page === queryTotalPages - 1) {
                      return <span key={page} className="adm-pagination-ellipsis">…</span>;
                    }
                    return null;
                  })}
                  <button
                    className="adm-pagination-btn"
                    onClick={() => setQueryPage(p => Math.min(queryTotalPages, p + 1))}
                    disabled={queryPage === queryTotalPages}
                    aria-label="Next page"
                  >
                    →
                  </button>
                </div>
              </div>
              )}
            </section>
          )}

          {tab === 'audit' && (
            <section className="adm-stats" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="adm-toolbar">
                <button
                  className="adm-btn adm-btn--primary"
                  onClick={() => void loadAuditLogs()}
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
          )}
        </div>
      </main>

      {/* Toast notifications */}
      <div className="adm-toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`adm-toast adm-toast--${toast.type}`}>
            <span className="adm-toast-icon">
              {toast.type === 'success' ? '✅' : '❌'}
            </span>
            <span className="adm-toast-content">{toast.message}</span>
            <button
              className="adm-toast-close"
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
