import { useState, useEffect, useMemo } from 'react';
import type { AdminUser } from './types.ts';

interface UsersTabProps {
  accessToken: string;
  showToast: (type: 'success' | 'error', message: string) => void;
  setError: (error: string | null) => void;
}

const PAGE_SIZE = 5;

export function UsersTab({ accessToken, showToast, setError }: UsersTabProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function fetchUsers() {
      try {
        const response = await fetch('/api/admin/users', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null) as { error?: string } | null;
          throw new Error(payload?.error ?? `Failed to load users (${response.status}).`);
        }

        const payload = await response.json() as { users: AdminUser[] };
        if (!ignore) {
          setUsers(payload.users);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Unable to load users.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void fetchUsers();
    return () => { ignore = true; };
  }, [accessToken, refreshKey, setError]);

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

  const updateRole = async (userId: string, role: 'user' | 'admin') => {
    setSavingId(userId);
    setError(null);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userId, role }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error ?? `Failed to update user (${response.status}).`);
      }

      setLoading(true);
      setRefreshKey(k => k + 1);
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
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error ?? `Failed to delete user (${response.status}).`);
      }

      setLoading(true);
      setRefreshKey(k => k + 1);
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
            onChange={(event) => {
              setQuery(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Email, name, role"
          />
        </label>

        <button
          className="adm-btn adm-btn--primary"
          onClick={() => {
            setLoading(true);
            setRefreshKey(k => k + 1);
          }}
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
              paginatedUsers.map((user) => (
                <tr key={user.id}>
                  <td data-label="User">
                    <div className="adm-user-cell">
                      <strong>{user.full_name ?? 'Anonymous'}</strong>
                      <span>{user.id}</span>
                    </div>
                  </td>
                  <td data-label="Email">{user.email ?? 'No email'}</td>
                  <td data-label="Role">
                    <span className={`adm-badge adm-badge--${user.role}`}>{user.role}</span>
                  </td>
                  <td data-label="Created">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td data-label="Last sign in">
                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}
                  </td>
                  <td data-label="Actions">
                    <div className="adm-table-actions">
                      {user.role === 'user' ? (
                        <button
                          className="adm-btn adm-btn--outline"
                          onClick={() => void updateRole(user.id, 'admin')}
                          disabled={savingId === user.id}
                        >
                          Make admin
                        </button>
                      ) : (
                        <button
                          className="adm-btn adm-btn--outline"
                          onClick={() => void updateRole(user.id, 'user')}
                          disabled={savingId === user.id}
                        >
                          Demote
                        </button>
                      )}
                      <button
                        className="adm-btn adm-btn--danger"
                        onClick={() => void deleteUser(user.id)}
                        disabled={savingId === user.id}
                        aria-label={`Delete ${user.email ?? 'user'}`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="adm-pagination">
        <div className="adm-pagination-info">
          Showing {paginatedUsers.length} of {filteredUsers.length} user{(filteredUsers.length === 1 ? '' : 's')}
          {query.trim() ? ' (filtered)' : ''}
        </div>
        <div className="adm-pagination-controls">
          <button
            className="adm-pagination-btn"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            ←
          </button>
          <span className="adm-pagination-page">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="adm-pagination-btn"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
          >
            →
          </button>
        </div>
      </div>
    </>
  );
}
