import { useEffect, useRef, useState, useCallback } from 'react';
import type { ChatError } from '../api/chat.ts';

const ERROR_ICONS: Record<string, string> = {
  network: '📡',
  server: '🖥️',
  ratelimit: '⏱️',
  unknown: '⚠️',
};

const AUTO_DISMISS_SECONDS = 8;

interface ErrorBannerProps {
  error: ChatError;
  onRetry: () => void;
  onDismiss: () => void;
}

export function ErrorBanner({ error, onRetry, onDismiss }: ErrorBannerProps) {
  const [countdown, setCountdown] = useState(AUTO_DISMISS_SECONDS);
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(interval);
          onDismissRef.current();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const icon = ERROR_ICONS[error.kind] ?? '⚠️';
  const showRetry = error.kind !== 'unknown';

  const handleRetry = useCallback(() => {
    onDismiss();
    onRetry();
  }, [onDismiss, onRetry]);

  return (
    <div className="error-banner" role="alert" aria-live="assertive">
      <span className="error-icon" aria-hidden="true">{icon}</span>
      <span className="error-message">{error.message}</span>
      <div className="error-actions">
        {showRetry && (
          <button className="error-retry-btn" onClick={handleRetry} aria-label="Retry last message">
            Retry
          </button>
        )}
        <button
          className="error-dismiss-btn"
          onClick={onDismiss}
          aria-label={`Dismiss error (auto-closes in ${countdown}s)`}
          title={`Auto-closes in ${countdown}s`}
        >
          ✕ {countdown}s
        </button>
      </div>
    </div>
  );
}
