import { useEffect, useMemo, useState, useCallback } from 'react';
import type { Profile } from '../hooks/useAuth.ts';

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

const PAGE_SIZE = 5;

export function AdminDashboard({ session, profile, onBackToChat, onSignOut, notice }: AdminDashboardProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error'; message: string }>>([]);
  const [currentPage, setCurrentPage] = useState(1);

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

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, currentPage]);

  // Reset to page 1 when search changes
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
    <main className="screen-shell admin-shell">
      <section className="admin-panel">
        <header className="admin-topbar">
          <div>
            <p className="admin-kicker">Admin dashboard</p>
            <h1 className="admin-title">Manage users and roles</h1>
            <p className="admin-subtitle">Signed in as {profile.full_name ?? profile.email ?? 'admin'}.</p>
          </div>

          <div className="admin-actions">
            <button className="admin-secondary-btn" onClick={onBackToChat}>Back to chat</button>
            <button className="admin-secondary-btn" onClick={onSignOut}>Sign out</button>
          </div>
        </header>

        {notice && <div className="admin-notice">{notice}</div>}
        {error && <div className="admin-error" role="alert">{error}</div>}

        <section className="admin-stats">
          <article className="admin-stat-card"><span>Total users</span><strong>{stats.total}</strong></article>
          <article className="admin-stat-card"><span>Admins</span><strong>{stats.admins}</strong></article>
          <article className="admin-stat-card"><span>Regular users</span><strong>{stats.users}</strong></article>
        </section>

        <div className="admin-toolbar">
          <label className="admin-search">
            <span>Search</span>
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Email, name, role" />
          </label>

          <button className="admin-refresh-btn" onClick={() => void loadUsers()} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
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
                // Skeleton loading rows
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="admin-skeleton-row">
                    <td><div className="admin-skeleton-cell admin-skeleton-cell--long" /></td>
                    <td><div className="admin-skeleton-cell admin-skeleton-cell--medium" /></td>
                    <td><div className="admin-skeleton-cell admin-skeleton-cell--short" /></td>
                    <td><div className="admin-skeleton-cell admin-skeleton-cell--medium" /></td>
                    <td><div className="admin-skeleton-cell admin-skeleton-cell--medium" /></td>
                    <td><div className="admin-skeleton-cell admin-skeleton-cell--short" /></td>
                  </tr>
                ))
              ) : paginatedUsers.length === 0 ? (
                <tr><td colSpan={6} className="admin-empty">No users found.</td></tr>
              ) : (
                paginatedUsers.map(user => (
                  <tr key={user.id}>
                    <td><div className="admin-user-cell"><strong>{user.full_name ?? 'Unnamed user'}</strong><span>{user.id}</span></div></td>
                    <td>{user.email ?? 'No email'}</td>
                    <td>
                      <select className="admin-role-select" value={user.role} onChange={(event) => void updateRole(user.id, event.target.value as 'user' | 'admin')} disabled={savingId === user.id}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}</td>
                    <td><button className="admin-danger-btn" onClick={() => void deleteUser(user.id)} disabled={savingId === user.id}>Delete</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {!loading && filteredUsers.length > 0 && (
          <div className="admin-pagination">
            <div className="admin-pagination-info">
              Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="admin-pagination-controls">
              <button
                className="admin-pagination-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                ←
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1;
                // Show current page, first, last, and pages around current
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      className={`admin-pagination-btn ${page === currentPage ? 'admin-pagination-btn--active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                      aria-label={`Go to page ${page}`}
                      aria-current={page === currentPage ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  );
                }
                // Show ellipsis for gaps
                if (page === 2 || page === totalPages - 1) {
                  return <span key={page} className="admin-pagination-ellipsis">…</span>;
                }
                return null;
              })}
              <button
                className="admin-pagination-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                →
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.type}`}>
            <span className="toast-icon">{toast.type === 'success' ? '✅' : '❌'}</span>
            <span className="toast-content">{toast.message}</span>
            <button
              className="toast-close"
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}