import { FiMessageSquare, FiPlus, FiX, FiTrash2, FiLogOut, FiUser, FiSettings, FiDownload, FiUpload, FiUserCheck, FiFileText, FiHelpCircle } from 'react-icons/fi';
import { useState } from 'react';
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
  onExportSessions?: () => void;
  onImportSessions?: (file: File) => Promise<void>;
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
  onExportSessions,
  onImportSessions
}: SidebarProps) {
  const [showUserModal, setShowUserModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleImport = async () => {
    if (!importFile || !onImportSessions) return;
    setImporting(true);
    setImportError(null);
    setImportSuccess(false);
    try {
      await onImportSessions(importFile);
      setImportSuccess(true);
      setImportFile(null);
      // Close modal after a short delay to show success
      setTimeout(() => setShowUserModal(false), 1500);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportError(null);
      setImportSuccess(false);
    }
  };

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
                onClick={() => setShowUserModal(true)}
                title={`Profile: ${userLabel}`}
                aria-label="User profile"
              >
                <FiUser size={20} />
                <span>{userLabel}</span>
                <FiUserCheck className="profile-chevron" size={14} />
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

        {/* User Profile Modal */}
        {showUserModal && (
          <div className="user-modal-overlay" onClick={() => setShowUserModal(false)}>
            <div className="user-modal" onClick={(e) => e.stopPropagation()}>
              <div className="user-modal-header">
                <div className="user-modal-avatar">
                  <FiUser size={28} />
                </div>
                <div className="user-modal-info">
                  <h3 className="user-modal-name">{userLabel || 'User'}</h3>
                  <p className="user-modal-subtitle">{sessions.length} session{sessions.length !== 1 ? 's' : ''}</p>
                </div>
                <button className="user-modal-close" onClick={() => setShowUserModal(false)} aria-label="Close">
                  <FiX size={18} />
                </button>
              </div>

              <div className="user-modal-divider" />

              <div className="user-modal-section">
                <h4 className="user-modal-section-title">Data & Privacy</h4>
                
                <button 
                  className="user-modal-btn"
                  onClick={() => {
                    onExportSessions?.();
                    setShowUserModal(false);
                  }}
                  disabled={sessions.length === 0}
                >
                  <FiDownload size={18} />
                  <span>Export All Sessions</span>
                  <span className="user-modal-btn-hint">JSON</span>
                </button>

                <div className="user-modal-btn-import">
                  <label className="user-modal-btn" htmlFor="import-sessions-input">
                    <FiUpload size={18} />
                    <span>Import Sessions</span>
                    <span className="user-modal-btn-hint">JSON</span>
                  </label>
                  <input
                    id="import-sessions-input"
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    disabled={importing}
                  />
                </div>

                {importFile && (
                  <div className="import-preview">
                    <span className="import-file-name">{importFile.name}</span>
                    <button 
                      className="import-remove-btn" 
                      onClick={() => setImportFile(null)}
                      aria-label="Remove file"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                )}

                {importing && (
                  <div className="import-progress">
                    <div className="import-spinner" />
                    <span>Importing...</span>
                  </div>
                )}

                {importError && (
                  <div className="import-error" role="alert">
                    <FiHelpCircle size={14} />
                    <span>{importError}</span>
                  </div>
                )}

                {importSuccess && (
                  <div className="import-success" role="status">
                    <FiUserCheck size={14} />
                    <span>Imported successfully!</span>
                  </div>
                )}

                {!importing && importFile && onImportSessions && (
                  <button 
                    className="user-modal-btn user-modal-btn--primary"
                    onClick={handleImport}
                    disabled={importing}
                  >
                    <FiUpload size={18} />
                    <span>Confirm Import</span>
                  </button>
                )}
              </div>

              <div className="user-modal-divider" />

              <div className="user-modal-section">
                <h4 className="user-modal-section-title">Account</h4>
                {isAdmin && onOpenAdmin && (
                  <button 
                    className="user-modal-btn"
                    onClick={() => { onOpenAdmin(); setShowUserModal(false); }}
                  >
                    <FiSettings size={18} />
                    <span>Admin Panel</span>
                  </button>
                )}
                {onSignOut && (
                  <button 
                    className="user-modal-btn user-modal-btn--danger"
                    onClick={() => { onSignOut(); setShowUserModal(false); }}
                  >
                    <FiLogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
