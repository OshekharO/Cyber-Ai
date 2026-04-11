import { useRef, useEffect, useState, useCallback } from 'react';
import { MessageBubble, StreamingBubble } from './MessageBubble.tsx';
import { TypingIndicator } from './TypingIndicator.tsx';
import { ErrorBanner } from './ErrorBanner.tsx';
import type { Message } from '../hooks/useChat.ts';
import type { ChatError } from '../api/chat.ts';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  streamingContent: string;
  error: ChatError | null;
  theme: 'dark' | 'light';
  searchQuery: string;
  onFeedback: (id: number, fb: 'up' | 'down') => void;
  onRegenerate: () => void;
  onRetry: () => void;
  onDismissError: () => void;
}

export function MessageList({
  messages,
  loading,
  streamingContent,
  error,
  theme,
  searchQuery,
  onFeedback,
  onRegenerate,
  onRetry,
  onDismissError,
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Scroll to bottom when new messages / streaming
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, loading]);

  useEffect(() => {
    if (streamingContent) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [streamingContent]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const fromTop = el.scrollTop;
    const fromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollTop(fromTop > 200);
    setShowScrollBottom(fromBottom > 200);
  }, []);

  const scrollToTop = useCallback(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Filter messages by search query
  const visibleMessages = searchQuery.trim()
    ? messages.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return (
    <div
      className="messages-area"
      ref={containerRef}
      onScroll={handleScroll}
      role="log"
      aria-live="polite"
      aria-label="Conversation"
    >
      {visibleMessages.map((msg, i) => {
        const isLast = i === visibleMessages.length - 1 && msg.role === 'assistant';
        return (
          <MessageBubble
            key={msg.id}
            message={msg}
            isLast={isLast}
            theme={theme}
            onFeedback={onFeedback}
            onRegenerate={onRegenerate}
          />
        );
      })}

      {loading && !streamingContent && <TypingIndicator />}
      {loading && streamingContent && <StreamingBubble content={streamingContent} theme={theme} />}

      {error && (
        <ErrorBanner key={error.message} error={error} onRetry={onRetry} onDismiss={onDismissError} />
      )}

      <div ref={endRef} />

      {/* Scroll navigation buttons */}
      {showScrollTop && (
        <button
          className="scroll-btn scroll-btn--top"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          title="Scroll to top"
        >
          ↑
        </button>
      )}
      {showScrollBottom && (
        <button
          className="scroll-btn scroll-btn--bottom"
          onClick={scrollToBottom}
          aria-label="Jump to latest"
          title="Jump to latest"
        >
          ↓
        </button>
      )}
    </div>
  );
}
