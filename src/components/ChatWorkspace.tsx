import { useMemo, useState, useEffect, useCallback } from 'react';
import { Header } from './Header.tsx';
import { Sidebar } from './Sidebar.tsx';
import { WelcomeScreen } from './WelcomeScreen.tsx';
import { MessageList } from './MessageList.tsx';
import { InputBar } from './InputBar.tsx';
import { MessageSearch } from './MessageSearch.tsx';
import { useChat } from '../hooks/useChat.ts';

interface ChatWorkspaceProps {
  userId: string;
  userLabel: string;
  userEmail?: string;
  isAdmin: boolean;
  onOpenAdmin: () => void;
  onSignOut: () => void;
  onDeleteAccount?: () => void;
}

export function ChatWorkspace({ userId, userLabel, userEmail, isAdmin, onOpenAdmin, onSignOut, onDeleteAccount }: ChatWorkspaceProps) {
  const chat = useChat(userId);
  const [input, setInput] = useState('');

  // Clear all localStorage data (chat sessions, theme, etc.)
  const handleClearStorage = useCallback(() => {
    if (window.confirm('This will clear all local data including chat history and preferences. Continue?')) {
      localStorage.clear();
      // Reload to reset state
      window.location.reload();
    }
  }, []);

  // Delete account - calls the provided callback
  const handleDeleteAccount = useCallback(() => {
    if (onDeleteAccount) {
      onDeleteAccount();
    }
  }, [onDeleteAccount]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboardShortcuts = (e: KeyboardEvent) => {
      const isMac = navigator.userAgent.toLowerCase().includes('mac');
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + K - Toggle search
      if (modifier && e.key === 'k') {
        e.preventDefault();
        if (!chat.searchOpen && chat.messages.length > 0) {
          chat.toggleSearch();
        } else if (chat.searchOpen) {
          chat.toggleSearch();
        }
      }

      // Ctrl/Cmd + Shift + N - New session
      if (modifier && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        chat.newSession();
      }

      // Ctrl/Cmd + Shift + L - Toggle theme
      if (modifier && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        chat.toggleTheme();
      }

      // Escape - Close search if open
      if (e.key === 'Escape' && chat.searchOpen) {
        chat.toggleSearch();
      }
    };

    window.addEventListener('keydown', handleKeyboardShortcuts);
    return () => window.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [chat.searchOpen, chat.messages.length, chat.toggleSearch, chat.newSession, chat.toggleTheme]);

  const lastUserMessage = useMemo(() => [...chat.messages].reverse().find(m => m.role === 'user'), [chat.messages]);

  const handleSend = (text: string) => {
    chat.sendMessage(text);
  };

  const handleRetry = () => {
    if (lastUserMessage) {
      chat.sendMessage(lastUserMessage.content);
    }
  };

  const searchMatchCount = useMemo(
    () => chat.searchQuery.trim()
      ? chat.messages.filter(m => m.content.toLowerCase().includes(chat.searchQuery.toLowerCase())).length
      : 0,
    [chat.messages, chat.searchQuery],
  );

  return (
    <div className={`app${chat.sidebarOpen ? ' app--sidebar-open' : ''}`}>
      <Header
        theme={chat.theme}
        searchOpen={chat.searchOpen}
        loading={chat.loading}
        hasMessages={chat.messages.length > 0}
        sidebarOpen={chat.sidebarOpen}
        onToggleTheme={chat.toggleTheme}
        onToggleSearch={chat.toggleSearch}
        onToggleSidebar={chat.toggleSidebar}
        onExport={chat.exportMarkdown}
        onClear={chat.clearMessages}
      />

      {chat.searchOpen && (
        <MessageSearch
          query={chat.searchQuery}
          matchCount={searchMatchCount}
          onChange={chat.setSearchQuery}
          onClose={chat.toggleSearch}
        />
      )}

      <div className="app-body">
        <Sidebar
          sessions={chat.sessions}
          activeSessionId={chat.activeSessionId}
          open={chat.sidebarOpen}
          onNew={chat.newSession}
          onSwitch={chat.switchSession}
          onDelete={chat.deleteSession}
          onClose={() => chat.setSidebarOpen(false)}
          userLabel={userLabel}
          userEmail={userEmail}
          isAdmin={isAdmin}
          theme={chat.theme}
          onToggleTheme={chat.toggleTheme}
          onOpenAdmin={onOpenAdmin}
          onSignOut={onSignOut}
          onClearStorage={handleClearStorage}
          onDeleteAccount={handleDeleteAccount}
        />

        <div className="chat-container">
          {chat.messages.length === 0 && !chat.loading ? (
            <WelcomeScreen onSend={handleSend} />
          ) : (
            <MessageList
              messages={chat.messages}
              loading={chat.loading}
              streamingContent={chat.streamingContent}
              error={chat.error}
              theme={chat.theme}
              searchQuery={chat.searchQuery}
              onFeedback={chat.setFeedback}
              onRegenerate={chat.regenerate}
              onRetry={handleRetry}
              onDismissError={() => chat.setError(null)}
            />
          )}

          <InputBar
            input={input}
            loading={chat.loading}
            onChange={setInput}
            onSend={handleSend}
            onStop={chat.stopGenerating}
            onClear={chat.clearMessages}
          />
        </div>
      </div>
    </div>
  );
}