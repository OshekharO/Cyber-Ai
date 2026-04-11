import { useRef, useCallback, useEffect, useState, type KeyboardEvent } from 'react';
import { CommandPalette } from './CommandPalette.tsx';

const MAX_FILE_SIZE_BYTES = 100_000; // 100 KB
const PASTE_THRESHOLD = 1_000; // chars

interface InputBarProps {
  input: string;
  loading: boolean;
  onChange: (value: string) => void;
  onSend: (text: string) => void;
  onStop: () => void;
  onClear: () => void;
}

export function InputBar({ input, loading, onChange, onSend, onStop, onClear }: InputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pasteConfirm, setPasteConfirm] = useState<{ text: string } | null>(null);

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, []);

  useEffect(() => {
    autoResize();
  }, [input, autoResize]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = useCallback((text: string) => {
    if (!text.trim() || loading) return;
    onChange('');
    onSend(text);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [loading, onChange, onSend]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !loading) {
        handleSend(input);
      }
    }
    // Escape closes paste confirm
    if (e.key === 'Escape') {
      setPasteConfirm(null);
    }
  }, [input, loading, handleSend]);

  // Paste detection
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted.length > PASTE_THRESHOLD) {
      e.preventDefault();
      setPasteConfirm({ text: pasted });
    }
  }, []);

  // File upload
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_BYTES) {
      alert(`File too large (max ${MAX_FILE_SIZE_BYTES / 1000} KB).`);
      return;
    }
    const text = await file.text();
    const prefix = `[Attached file: ${file.name}]\n\`\`\`\n${text}\n\`\`\`\n\n`;
    onChange(prefix + input);
    // Reset input so same file can be re-selected
    e.target.value = '';
  }, [input, onChange]);

  const confirmPaste = useCallback(() => {
    if (!pasteConfirm) return;
    onChange(input + pasteConfirm.text);
    setPasteConfirm(null);
  }, [pasteConfirm, input, onChange]);

  const handleCommandSelect = useCallback((template: string) => {
    onChange(template);
    textareaRef.current?.focus();
  }, [onChange]);

  const handleCommandExecute = useCallback((cmd: string) => {
    if (cmd === '/clear') {
      onChange('');
      onClear();
    }
  }, [onChange, onClear]);

  const charCount = input.length;
  const isOverLimit = charCount > 4000;

  return (
    <div className="input-area">
      {/* Command palette */}
      <CommandPalette
        input={input}
        onSelect={handleCommandSelect}
        onExecute={handleCommandExecute}
      />

      {/* Paste confirm dialog */}
      {pasteConfirm && (
        <div className="paste-confirm" role="dialog" aria-label="Large paste detected">
          <span>📋 Large text pasted ({pasteConfirm.text.length.toLocaleString()} chars). Add to message?</span>
          <div className="paste-confirm-actions">
            <button className="paste-confirm-btn paste-confirm-btn--yes" onClick={confirmPaste}>Add</button>
            <button className="paste-confirm-btn paste-confirm-btn--no" onClick={() => setPasteConfirm(null)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="input-row">
        {/* File upload */}
        <button
          className="attach-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          aria-label="Attach a file"
          title="Attach file (text files, max 100 KB)"
        >
          📎
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.log,.conf,.json,.yaml,.yml,.py,.js,.ts,.sh,.md,.csv,.xml,.html,.css"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          aria-hidden="true"
        />

        <div className={`input-wrapper${isOverLimit ? ' input-wrapper--over-limit' : ''}`}>
          <textarea
            ref={textareaRef}
            className="chat-input"
            value={input}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Ask about cybersecurity… (type / for commands)"
            rows={1}
            disabled={loading && !input}
            aria-label="Message input"
            aria-multiline="true"
          />
        </div>

        {/* Send / Stop button */}
        {loading ? (
          <button
            className="send-btn send-btn--stop"
            onClick={onStop}
            aria-label="Stop generating"
            title="Stop generating"
          >
            ⏹
          </button>
        ) : (
          <button
            className="send-btn"
            onClick={() => handleSend(input)}
            disabled={!input.trim()}
            aria-label="Send message"
            title="Send"
          >
            ➤
          </button>
        )}
      </div>

      {/* Footer row */}
      <div className="input-footer">
        <span className="input-hint">↵ Send · Shift+↵ New line · / Commands</span>
        <span className={`char-count${isOverLimit ? ' char-count--over' : ''}`} aria-live="polite">
          {charCount.toLocaleString()} chars
        </span>
      </div>
    </div>
  );
}
