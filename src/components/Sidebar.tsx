import { FiMessageSquare, FiPlus, FiX, FiTrash2, FiLogOut, FiUser, FiSettings } from 'react-icons/fi';
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
  onSignOut 
}: SidebarProps) {
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
    </>
  );
}
