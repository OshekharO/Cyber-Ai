import { useState, useCallback } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';
import type { Message } from '../hooks/useChat.ts';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

// ── Code block with copy button ───────────────────────────────────────────────

interface CodeBlockProps {
  language: string;
  code: string;
  theme: 'dark' | 'light';
}

function CodeBlock({ language, code, theme }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await copyToClipboard(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-lang">{language || 'code'}</span>
        <button className="copy-btn" onClick={handleCopy} aria-label="Copy code">
          {copied ? '✅ Copied' : '📋 Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={theme === 'dark' ? oneDark : oneLight}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: '0 0 8px 8px', fontSize: '13px' }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

// ── Markdown components factory ───────────────────────────────────────────────

function makeComponents(theme: 'dark' | 'light'): Components {
  return {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className ?? '');
      const isBlock = !Object.prototype.hasOwnProperty.call(props, 'inline') && (match !== null || String(children).includes('\n'));
      const codeStr = String(children).replace(/\n$/, '');

      if (isBlock) {
        return <CodeBlock language={match?.[1] ?? ''} code={codeStr} theme={theme} />;
      }
      return <code className={`inline-code${className ? ` ${className}` : ''}`}>{children}</code>;
    },
    a({ href, children }) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="md-link">
          {children}
        </a>
      );
    },
    table({ children }) {
      return <div className="table-wrapper"><table className="md-table">{children}</table></div>;
    },
  };
}

// ── Message actions bar ───────────────────────────────────────────────────────

interface ActionsProps {
  message: Message;
  isLast: boolean;
  isUser: boolean;
  onFeedback: (id: number, fb: 'up' | 'down') => void;
  onRegenerate: () => void;
}

function MessageActions({ message, isLast, isUser, onFeedback, onRegenerate }: ActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await copyToClipboard(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message.content]);

  return (
    <div className="message-actions" role="toolbar" aria-label="Message actions">
      <button
        className="msg-action-btn"
        onClick={handleCopy}
        aria-label="Copy message"
        title="Copy"
      >
        {copied ? '✅' : '📋'}
      </button>

      {!isUser && (
        <>
          <button
            className={`msg-action-btn${message.feedback === 'up' ? ' msg-action-btn--active' : ''}`}
            onClick={() => onFeedback(message.id, 'up')}
            aria-label="Thumbs up"
            aria-pressed={message.feedback === 'up'}
            title="Good response"
          >
            👍
          </button>
          <button
            className={`msg-action-btn${message.feedback === 'down' ? ' msg-action-btn--active' : ''}`}
            onClick={() => onFeedback(message.id, 'down')}
            aria-label="Thumbs down"
            aria-pressed={message.feedback === 'down'}
            title="Poor response"
          >
            👎
          </button>
          {isLast && (
            <button
              className="msg-action-btn"
              onClick={onRegenerate}
              aria-label="Regenerate response"
              title="Regenerate"
            >
              🔁
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ── MessageBubble ─────────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
  theme: 'dark' | 'light';
  searchQuery: string;
  onFeedback: (id: number, fb: 'up' | 'down') => void;
  onRegenerate: () => void;
}

function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;
  return text; // Actual highlight is done via CSS mark; we return plain text for non-markdown
}

export function MessageBubble({ message, isLast, theme, searchQuery, onFeedback, onRegenerate }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const components = makeComponents(theme);

  // Highlight search matches in user messages (plain text)
  const displayContent = isUser && searchQuery
    ? highlightText(message.content, searchQuery)
    : message.content;

  return (
    <div className={`message ${isUser ? 'user' : 'ai'}`}>
      <div className={`avatar ${isUser ? 'user' : 'ai'}`} aria-label={isUser ? 'You' : 'Cyber AI'}>
        {isUser ? '👤' : '🤖'}
      </div>

      <div className="message-body">
        <div className={`bubble${isUser ? ' bubble--user' : ' bubble--ai'}`}>
          {isUser ? (
            <div className="user-text">{displayContent}</div>
          ) : (
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={components}
            >
              {message.content}
            </Markdown>
          )}
        </div>

        <div className={`message-footer${isUser ? ' message-footer--user' : ''}`}>
          <time className="message-time" dateTime={message.timestamp}>
            {formatTime(message.timestamp)}
          </time>
          {message.feedback === 'up' && <span className="feedback-badge">👍</span>}
          {message.feedback === 'down' && <span className="feedback-badge">👎</span>}
        </div>

        <MessageActions
          message={message}
          isLast={isLast}
          isUser={isUser}
          onFeedback={onFeedback}
          onRegenerate={onRegenerate}
        />
      </div>
    </div>
  );
}

// ── Streaming bubble (partial content during streaming) ───────────────────────

interface StreamingBubbleProps {
  content: string;
  theme: 'dark' | 'light';
}

export function StreamingBubble({ content, theme }: StreamingBubbleProps) {
  const components = makeComponents(theme);

  return (
    <div className="message ai">
      <div className="avatar ai" aria-label="Cyber AI">🤖</div>
      <div className="message-body">
        <div className="bubble bubble--ai bubble--streaming">
          <Markdown remarkPlugins={[remarkGfm]} components={components}>
            {content}
          </Markdown>
          <span className="streaming-cursor" aria-hidden="true">▋</span>
        </div>
      </div>
    </div>
  );
}
