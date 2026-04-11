import { useState, useCallback, useMemo, memo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';
import type { Message } from '../hooks/useChat.ts';

// Register only the languages needed for a cybersecurity context.
// Using PrismLight + explicit registration keeps the bundle ~80 % smaller
// compared to the default Prism build which ships all 200+ languages.
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import http from 'react-syntax-highlighter/dist/esm/languages/prism/http';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import c from 'react-syntax-highlighter/dist/esm/languages/prism/c';
import powershell from 'react-syntax-highlighter/dist/esm/languages/prism/powershell';
import ruby from 'react-syntax-highlighter/dist/esm/languages/prism/ruby';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';
import docker from 'react-syntax-highlighter/dist/esm/languages/prism/docker';
import diff from 'react-syntax-highlighter/dist/esm/languages/prism/diff';
import php from 'react-syntax-highlighter/dist/esm/languages/prism/php';

SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('shell', bash);
SyntaxHighlighter.registerLanguage('sh', bash);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('py', python);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('js', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('ts', typescript);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('yaml', yaml);
SyntaxHighlighter.registerLanguage('yml', yaml);
SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('http', http);
SyntaxHighlighter.registerLanguage('html', markup);
SyntaxHighlighter.registerLanguage('xml', markup);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('c', c);
SyntaxHighlighter.registerLanguage('powershell', powershell);
SyntaxHighlighter.registerLanguage('ps1', powershell);
SyntaxHighlighter.registerLanguage('ruby', ruby);
SyntaxHighlighter.registerLanguage('rb', ruby);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('go', go);
SyntaxHighlighter.registerLanguage('docker', docker);
SyntaxHighlighter.registerLanguage('dockerfile', docker);
SyntaxHighlighter.registerLanguage('diff', diff);
SyntaxHighlighter.registerLanguage('php', php);

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
  onFeedback: (id: number, fb: 'up' | 'down') => void;
  onRegenerate: () => void;
}

function MessageBubbleInner({ message, isLast, theme, onFeedback, onRegenerate }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const components = useMemo(() => makeComponents(theme), [theme]);

  return (
    <div className={`message ${isUser ? 'user' : 'ai'}`}>
      <div className={`avatar ${isUser ? 'user' : 'ai'}`} aria-label={isUser ? 'You' : 'Cyber AI'}>
        {isUser ? '👤' : '🤖'}
      </div>

      <div className="message-body">
        <div className={`bubble${isUser ? ' bubble--user' : ' bubble--ai'}`}>
          {isUser ? (
            <div className="user-text">{message.content}</div>
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

// Wrap with memo so that a MessageBubble only re-renders when its own props
// change, not on every streaming token update.
export const MessageBubble = memo(MessageBubbleInner);

// ── Streaming bubble (partial content during streaming) ───────────────────────

interface StreamingBubbleProps {
  content: string;
  theme: 'dark' | 'light';
}

export function StreamingBubble({ content, theme }: StreamingBubbleProps) {
  const components = useMemo(() => makeComponents(theme), [theme]);

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
