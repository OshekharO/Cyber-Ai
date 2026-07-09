import { FiSearch, FiX } from 'react-icons/fi';

interface MessageSearchProps {
  query: string;
  matchCount: number;
  onChange: (q: string) => void;
  onClose: () => void;
}

export function MessageSearch({ query, matchCount, onChange, onClose }: MessageSearchProps) {
  return (
    <div className="message-search" role="search" aria-label="Search messages">
      <FiSearch className="search-icon" aria-hidden="true" size={20} />
      <input
        className="search-input"
        type="search"
        placeholder="Search messages…"
        value={query}
        onChange={e => onChange(e.target.value)}
        autoFocus
        aria-label="Search messages"
      />
      {query && (
        <span className="search-count" aria-live="polite">
          {matchCount} match{matchCount !== 1 ? 'es' : ''}
        </span>
      )}
      <button className="search-close-btn" onClick={onClose} aria-label="Close search">
        <FiX size={16} />
      </button>
    </div>
  );
}
