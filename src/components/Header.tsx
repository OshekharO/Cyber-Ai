interface HeaderProps {
  theme: 'dark' | 'light';
  searchOpen: boolean;
  loading: boolean;
  hasMessages: boolean;
  sidebarOpen: boolean;
  userLabel?: string;
  isAdmin?: boolean;
  onToggleTheme: () => void;
  onToggleSearch: () => void;
  onToggleSidebar: () => void;
  onExport: () => void;
  onClear: () => void;
  onOpenAdmin?: () => void;
  onSignOut?: () => void;
}

export function Header({
  theme,
  searchOpen,
  loading,
  hasMessages,
  sidebarOpen,
  userLabel,
  isAdmin,
  onToggleTheme,
  onToggleSearch,
  onToggleSidebar,
  onExport,
  onClear,
  onOpenAdmin,
  onSignOut,
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
          ☰
        </button>

        <div className="header-brand">
          <div className="header-logo" aria-hidden="true">🛡️</div>
          <span className="header-title">Cyber AI</span>
        </div>
      </div>

      <div className="header-actions">
        {(userLabel || isAdmin || onOpenAdmin || onSignOut) && (
          <div className="header-account">
            {userLabel && <span className="header-user-chip" title={userLabel}>{userLabel}</span>}
            {isAdmin && onOpenAdmin && (
              <button
                className="header-account-btn"
                onClick={onOpenAdmin}
                aria-label="Open admin dashboard"
                title="Admin dashboard"
              >
                Admin
              </button>
            )}
            {onSignOut && (
              <button
                className="header-account-btn header-account-btn--ghost"
                onClick={onSignOut}
                aria-label="Sign out"
                title="Sign out"
              >
                Sign out
              </button>
            )}
          </div>
        )}

        {hasMessages && (
          <>
            <button
              className={`header-icon-btn${searchOpen ? ' active' : ''}`}
              onClick={onToggleSearch}
              aria-label="Search messages"
              aria-pressed={searchOpen}
              title="Search messages"
            >
              🔍
            </button>
            <button
              className="header-icon-btn"
              onClick={onExport}
              aria-label="Export conversation as Markdown"
              title="Export as Markdown"
              disabled={loading}
            >
              ⬇️
            </button>
            <button
              className="header-icon-btn"
              onClick={onClear}
              aria-label="Clear conversation"
              title="Clear conversation"
              disabled={loading}
            >
              🗑️
            </button>
          </>
        )}

        <button
          className="header-icon-btn"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <div className="header-status" aria-live="polite" aria-label={loading ? 'Processing' : 'Online'}>
          <div className={`status-dot${loading ? ' status-dot--busy' : ''}`} aria-hidden="true" />
        </div>
      </div>
    </header>
  );
}
