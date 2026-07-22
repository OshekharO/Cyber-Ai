import { FiMenu, FiShield, FiSearch, FiDownload, FiTrash2 } from 'react-icons/fi';

interface HeaderProps {
  searchOpen: boolean;
  loading: boolean;
  hasMessages: boolean;
  sidebarOpen: boolean;
  onToggleSearch: () => void;
  onToggleSidebar: () => void;
  onExport: () => void;
  onClear: () => void;
}

export function Header({
  searchOpen,
  loading,
  hasMessages,
  sidebarOpen,
  onToggleSearch,
  onToggleSidebar,
  onExport,
  onClear,
}: HeaderProps) {
  return (
    <header className="header" role="banner">
      <div className="header-left">
        <button
          className={`sidebar-toggle-btn${sidebarOpen ? ' active' : ''}`}
          onClick={onToggleSidebar}
          aria-label="Toggle session sidebar"
          aria-expanded={sidebarOpen}
        >
          <FiMenu size={18} />
        </button>

        <div className="header-brand">
          <div className="header-logo" aria-hidden="true">
            <FiShield size={18} />
          </div>
          <span className="header-title">Cyber AI</span>
        </div>
      </div>

      <div className="header-actions">

        {hasMessages && (
          <>
            <button
              className={`header-icon-btn${searchOpen ? ' active' : ''}`}
              onClick={onToggleSearch}
              aria-label="Search messages"
              aria-pressed={searchOpen}
              title="Search messages"
            >
              <FiSearch size={18} />
            </button>
            <button
              className="header-icon-btn"
              onClick={onExport}
              aria-label="Export conversation as Markdown"
              title="Export as Markdown"
              disabled={loading}
            >
              <FiDownload size={18} />
            </button>
            <button
              className="header-icon-btn"
              onClick={onClear}
              aria-label="Clear conversation"
              title="Clear conversation"
              disabled={loading}
            >
              <FiTrash2 size={18} />
            </button>
          </>
        )}

        <div className="header-status" aria-live="polite" aria-label={loading ? 'Processing' : 'Online'}>
          <div className={`status-dot${loading ? ' status-dot--busy' : ''}`} aria-hidden="true" />
        </div>
      </div>
    </header>
  );
}
