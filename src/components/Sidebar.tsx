import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentAlt, faPlus, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import type { Session } from '../hooks/useChat.ts';

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string;
  open: boolean;
  onNew: () => void;
  onSwitch: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function Sidebar({ sessions, activeSessionId, open, onNew, onSwitch, onDelete, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />}

      <aside className={`sidebar${open ? ' sidebar--open' : ''}`} aria-label="Chat sessions">
        <div className="sidebar-header">
          <span className="sidebar-title">Sessions</span>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <button className="new-chat-btn" onClick={onNew} aria-label="New chat">
          <FontAwesomeIcon icon={faPlus} /> New Chat
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
                <FontAwesomeIcon icon={faCommentAlt} className="session-icon" />
                <span className="session-name">{session.name}</span>
              </button>
              <button
                className="session-delete-btn"
                onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
                aria-label={`Delete session "${session.name}"`}
                title="Delete"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
