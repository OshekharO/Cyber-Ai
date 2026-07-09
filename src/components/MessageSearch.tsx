import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';

interface MessageSearchProps {
  query: string;
  matchCount: number;
  onChange: (q: string) => void;
  onClose: () => void;
}

export function MessageSearch({ query, matchCount, onChange, onClose }: MessageSearchProps) {
  return (
    <div className="message-search" role="search" aria-label="Search messages">
      <FontAwesomeIcon icon={faSearch} className="search-icon" aria-hidden="true" />
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
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
  );
}
