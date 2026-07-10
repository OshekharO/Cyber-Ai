import { useEffect, useMemo, useState } from 'react';
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

export function AdminDashboard({ session, profile, onBackToChat, onSignOut, notice }: AdminDashboardProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update user.');
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete user.');
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
              {loading && filteredUsers.length === 0 ? (
                <tr><td colSpan={6} className="admin-empty">Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={6} className="admin-empty">No users found.</td></tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td data-label="User"><div className="admin-user-cell"><strong>{user.full_name ?? 'Unnamed user'}</strong><span>{user.id}</span></div></td>
                    <td data-label="Email">{user.email ?? 'No email'}</td>
                    <td data-label="Role">
                      <select className="admin-role-select" value={user.role} onChange={(event) => void updateRole(user.id, event.target.value as 'user' | 'admin')} disabled={savingId === user.id}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td data-label="Created">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td data-label="Last sign in">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}</td>
                    <td data-label="Actions"><button className="admin-danger-btn" onClick={() => void deleteUser(user.id)} disabled={savingId === user.id}>Delete</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}