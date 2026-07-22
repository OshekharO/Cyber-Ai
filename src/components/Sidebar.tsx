import { useState } from 'react';
import { FiMessageSquare, FiPlus, FiX, FiTrash2, FiLogOut, FiUser, FiSettings, FiSun, FiMoon, FiDatabase } from 'react-icons/fi';
import type { Session } from '../hooks/useChat.ts';

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string;
  open: boolean;
  onNew: () => void;
  onSwitch: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  userLabel?: string;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  onSignOut?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onClearLocalStorage?: () => void;
  onDeleteAccount?: () => void;
}

export function Sidebar({ 
  sessions, 
  activeSessionId, 
  open, 
  onNew, 
  onSwitch, 
  onDelete, 
  onClose,
  userLabel,
  isAdmin,
  onOpenAdmin,
  onSignOut,
  theme,
  onToggleTheme,
  onClearLocalStorage,
  onDeleteAccount
}: SidebarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <>
      {/* Mobile backdrop */}
      {open && <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />}

      <aside className={`sidebar${open ? ' sidebar--open' : ''}`} aria-label="Chat sessions">
        <div className="sidebar-header">
          <span className="sidebar-title">Sessions</span>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
            <FiX size={16} />
          </button>
        </div>

        <button className="new-chat-btn" onClick={onNew} aria-label="New chat">
          <FiPlus size={20} /> New Chat
        </button>

        <nav className="session-list" role="list">
          {sessions.map(session => (
            <div
              key={session.id}
              className={`session-item${session.id === activeSessionId ? ' session-item--active' : ''}`}
              role="listitem"
            >
              <button
                className="session-name-btn"
                onClick={() => onSwitch(session.id)}
                aria-current={session.id === activeSessionId ? 'page' : undefined}
                title={session.name}
              >
                <FiMessageSquare className="session-icon" size={18} />
                <span className="session-name">{session.name}</span>
              </button>
              <button
                className="session-delete-btn"
                onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
                aria-label={`Delete session "${session.name}"`}
                title="Delete"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
        </nav>

        {/* User section at bottom */}
        {(userLabel || isAdmin || onOpenAdmin || onSignOut) && (
          <div className="sidebar-user-section">
            {userLabel && (
              <button
                className="sidebar-profile-btn"
                title={`Profile: ${userLabel}`}
                aria-label="User profile"
                onClick={() => setShowProfileMenu(true)}
              >
                <FiUser size={20} />
                <span>{userLabel}</span>
              </button>
            )}
            
            {isAdmin && onOpenAdmin && (
              <button
                className="sidebar-admin-btn"
                onClick={onOpenAdmin}
                aria-label="Open admin dashboard"
                title="Admin dashboard"
              >
                <FiSettings size={16} />
                <span>Admin Panel</span>
              </button>
            )}
            
            {onSignOut && (
              <button
                className="sidebar-logout-btn"
                onClick={onSignOut}
                aria-label="Sign out"
                title="Sign out"
              >
                <FiLogOut size={16} />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        )}
      </aside>

      {/* Profile menu modal */}
      {showProfileMenu && (
        <div className="profile-menu-overlay" onClick={() => setShowProfileMenu(false)}>
          <div className="profile-menu" onClick={(e) => e.stopPropagation()}>
            {userLabel && (
              <div className="profile-menu-header">
                <FiUser size={20} />
                <span>{userLabel}</span>
              </div>
            )}
            <div className="profile-menu-divider" />
            {onToggleTheme && theme && (
              <button className="profile-menu-item" onClick={() => { onToggleTheme(); setShowProfileMenu(false); }}>
                {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            )}
            {onClearLocalStorage && (
              <button className="profile-menu-item" onClick={() => { if (window.confirm('Clear all local data? This cannot be undone.')) { onClearLocalStorage(); } setShowProfileMenu(false); }}>
                <FiDatabase size={18} />
                <span>Clear Local Storage</span>
              </button>
            )}
            {onDeleteAccount && (
              <button className="profile-menu-item profile-menu-item--danger" onClick={() => { if (window.confirm('Delete your account and all data? This cannot be undone.')) { onDeleteAccount(); } setShowProfileMenu(false); }}>
                <FiTrash2 size={18} />
                <span>Delete Account</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
