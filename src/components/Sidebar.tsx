import { useState, useEffect } from 'react';
import { FiMessageSquare, FiPlus, FiX, FiTrash2, FiLogOut, FiUser, FiSettings, FiSun, FiMoon, FiDatabase, FiEdit2 } from 'react-icons/fi';
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
  onRename?: (id: string, name: string) => void;
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
  onDeleteAccount,
  onRename
}: SidebarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    if (!showShortcuts) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowShortcuts(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showShortcuts]);

  const startRename = (session: Session) => {
    if (!onRename) return;
    setRenamingId(session.id);
    setRenameValue(session.name);
  };

  const commitRename = () => {
    if (renamingId && renameValue.trim() && onRename) {
      onRename(renamingId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue('');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />}

      <aside className={`sidebar${open ? ' sidebar--open' : ''}`} aria-label="Chat sessions">
        <div className="sidebar-header">
          <span className="sidebar-title">Sessions</span>
          <div className="sidebar-header-actions">
            <button className="sidebar-help-btn" onClick={() => setShowShortcuts(true)} aria-label="Keyboard shortcuts" title="Keyboard shortcuts">
              ?
            </button>
            <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
              <FiX size={16} />
            </button>
          </div>
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
              {renamingId === session.id ? (
                <input
                  className="session-rename-input"
                  type="text"
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { e.preventDefault(); commitRename(); }
                    if (e.key === 'Escape') { e.preventDefault(); cancelRename(); }
                  }}
                  autoFocus
                  maxLength={60}
                />
              ) : (
                <>
                  <button
                    className="session-name-btn"
                    onClick={() => onSwitch(session.id)}
                    title="Double-click to rename"
                    onDoubleClick={() => startRename(session)}
                  >
                    <FiMessageSquare className="session-icon" size={18} />
                    <span className="session-name">{session.name}</span>
                  </button>
                  {onRename && (
                    <button
                      className="session-rename-btn"
                      onClick={(e) => { e.stopPropagation(); startRename(session); }}
                      aria-label={`Rename session "${session.name}"`}
                      title="Rename"
                    >
                      <FiEdit2 size={14} />
                    </button>
                  )}
                  <button
                    className="session-delete-btn"
                    onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
                    aria-label={`Delete session "${session.name}"`}
                    title="Delete"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </>
              )}
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

      {/* Keyboard shortcuts modal */}
      {showShortcuts && (
        <div className="shortcuts-overlay" onClick={() => setShowShortcuts(false)}>
          <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
            <div className="shortcuts-header">
              <h2 className="shortcuts-title">Keyboard Shortcuts</h2>
              <button className="shortcuts-close" onClick={() => setShowShortcuts(false)} aria-label="Close">✕</button>
            </div>
            <div className="shortcuts-body">
              <div className="shortcut-item">
                <kbd>Ctrl + K</kbd>
                <span>Search messages</span>
              </div>
              <div className="shortcut-item">
                <kbd>Ctrl + Shift + N</kbd>
                <span>New chat</span>
              </div>
              <div className="shortcut-item">
                <kbd>Ctrl + Shift + L</kbd>
                <span>Toggle theme</span>
              </div>
              <div className="shortcut-item">
                <kbd>Escape</kbd>
                <span>Close search</span>
              </div>
              <div className="shortcut-item">
                <kbd>Double-click session</kbd>
                <span>Rename session</span>
              </div>
            </div>
          </div>
        </div>
      )}

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
