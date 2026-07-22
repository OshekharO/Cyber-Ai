import { useEffect, useRef } from 'react';
import { FiX, FiTrash2, FiMoon, FiSun, FiUser, FiSettings, FiLogOut, FiAlertTriangle } from 'react-icons/fi';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLabel: string;
  userEmail?: string;
  userAvatar?: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onClearStorage: () => void;
  onDeleteAccount: () => void;
  onSignOut: () => void;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
}

export function UserProfileModal({
  isOpen,
  onClose,
  userLabel,
  userEmail,
  userAvatar,
  theme,
  onToggleTheme,
  onClearStorage,
  onDeleteAccount,
  onSignOut,
  isAdmin,
  onOpenAdmin,
}: UserProfileModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Focus management and keyboard navigation
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      // Focus the close button for accessibility
      setTimeout(() => modalRef.current?.querySelector('button')?.focus(), 0);
    } else {
      document.body.style.overflow = '';
      previousActiveElement.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  if (!isOpen) return null;

  const initials = userLabel
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="profile-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      aria-describedby="profile-modal-desc"
    >
      <div
        ref={modalRef}
        className="profile-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="profile-modal-header">
          <div className="profile-modal-avatar">
            {userAvatar ? (
              <img src={userAvatar} alt="" aria-hidden="true" />
            ) : (
              <span className="profile-modal-initials">{initials}</span>
            )}
          </div>
          <div className="profile-modal-user-info">
            <h2 id="profile-modal-title" className="profile-modal-name">
              {userLabel}
            </h2>
            {userEmail && (
              <p id="profile-modal-desc" className="profile-modal-email">
                {userEmail}
              </p>
            )}
          </div>
          <button
            className="profile-modal-close"
            onClick={onClose}
            aria-label="Close profile menu"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="profile-modal-divider" aria-hidden="true" />

        <nav className="profile-modal-menu" role="menu">
          {/* Theme Toggle */}
          <button
            className="profile-modal-item"
            onClick={onToggleTheme}
            role="menuitem"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <div className="profile-modal-item-icon">
              {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
            </div>
            <div className="profile-modal-item-content">
              <span className="profile-modal-item-label">Theme</span>
              <span className="profile-modal-item-value">
                {theme === 'dark' ? 'Dark' : 'Light'}
              </span>
            </div>
            <FiSettings size={16} className="profile-modal-item-chevron" />
          </button>

          {/* Admin Panel (if admin) */}
          {isAdmin && onOpenAdmin && (
            <button
              className="profile-modal-item"
              onClick={() => {
                onOpenAdmin();
                onClose();
              }}
              role="menuitem"
              aria-label="Open admin panel"
            >
              <div className="profile-modal-item-icon">
                <FiSettings size={18} />
              </div>
              <div className="profile-modal-item-content">
                <span className="profile-modal-item-label">Admin Panel</span>
                <span className="profile-modal-item-value">Manage users & settings</span>
              </div>
              <FiSettings size={16} className="profile-modal-item-chevron" />
            </button>
          )}

          <div className="profile-modal-divider" aria-hidden="true" />

          {/* Clear Local Storage */}
          <button
            className="profile-modal-item profile-modal-item--warning"
            onClick={() => {
              if (window.confirm('This will clear all local chat data and settings. Continue?')) {
                onClearStorage();
                onClose();
              }
            }}
            role="menuitem"
            aria-label="Clear local storage"
          >
            <div className="profile-modal-item-icon">
              <FiTrash2 size={18} />
            </div>
            <div className="profile-modal-item-content">
              <span className="profile-modal-item-label">Clear Local Data</span>
              <span className="profile-modal-item-value">
                Remove chats, sessions & preferences
              </span>
            </div>
            <FiAlertTriangle size={16} className="profile-modal-item-chevron" />
          </button>

          {/* Delete Account */}
          <button
            className="profile-modal-item profile-modal-item--danger"
            onClick={() => {
              if (
                window.confirm(
                  'This will permanently delete your account and all data. This action cannot be undone. Continue?'
                )
              ) {
                onDeleteAccount();
                onClose();
              }
            }}
            role="menuitem"
            aria-label="Delete account"
          >
            <div className="profile-modal-item-icon profile-modal-item-icon--danger">
              <FiTrash2 size={18} />
            </div>
            <div className="profile-modal-item-content">
              <span className="profile-modal-item-label">Delete Account</span>
              <span className="profile-modal-item-value">
                Permanently remove your account
              </span>
            </div>
            <FiAlertTriangle size={16} className="profile-modal-item-chevron" />
          </button>

          <div className="profile-modal-divider" aria-hidden="true" />

          {/* Sign Out */}
          <button
            className="profile-modal-item profile-modal-item--signout"
            onClick={() => {
              onSignOut();
              onClose();
            }}
            role="menuitem"
            aria-label="Sign out"
          >
            <div className="profile-modal-item-icon">
              <FiLogOut size={18} />
            </div>
            <div className="profile-modal-item-content">
              <span className="profile-modal-item-label">Sign Out</span>
              <span className="profile-modal-item-value">End current session</span>
            </div>
          </button>
        </nav>
      </div>
    </div>
  );
}