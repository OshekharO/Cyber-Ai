export function TypingIndicator() {
  return (
    <div className="typing-indicator" aria-label="Cyber AI is thinking" role="status">
      <div className="avatar ai" aria-hidden="true">🤖</div>
      <div className="typing-bubble">
        <div className="skeleton-line skeleton-line--long" />
        <div className="skeleton-line skeleton-line--medium" />
        <div className="skeleton-line skeleton-line--short" />
        <div className="typing-dots" aria-hidden="true">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  );
}
