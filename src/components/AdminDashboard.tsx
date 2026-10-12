import { useState, useCallback } from 'react';
import type { Profile } from '../hooks/useAuth.ts';
import type { AdminTab } from './admin/types.ts';
import { UsersTab } from './admin/UsersTab.tsx';
import { QueriesTab } from './admin/QueriesTab.tsx';
import { AuditTab } from './admin/AuditTab.tsx';
import './AdminDashboard.css';

// Re-export type definitions for backwards compatibility if needed elsewhere
export type { AdminUser, AdminQuery, AdminAuditLog } from './admin/types.ts';

interface AdminDashboardProps {
  session: { access_token: string };
  profile: Profile;
  onBackToChat: () => void;
  onSignOut: () => void;
  notice?: string | null;
}

export function AdminDashboard({ session, profile, onBackToChat, onSignOut, notice }: AdminDashboardProps) {
  const [tab, setTab] = useState<AdminTab>('users');
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error'; message: string }>>([]);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

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
            <UsersTab
              accessToken={session.access_token}
              showToast={showToast}
              setError={setError}
            />
          )}

          {tab === 'queries' && (
            <QueriesTab accessToken={session.access_token} />
          )}

          {tab === 'audit' && (
            <AuditTab accessToken={session.access_token} />
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
