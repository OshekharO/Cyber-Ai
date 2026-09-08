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
  sessionToken?: string | null;
  userLabel: string;
  isAdmin: boolean;
  onOpenAdmin: () => void;
  onSignOut: () => void;
}

export function ChatWorkspace({ userId, sessionToken, userLabel, isAdmin, onOpenAdmin, onSignOut }: ChatWorkspaceProps) {
  const chat = useChat(userId, sessionToken ?? undefined);
  const [input, setInput] = useState('');

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
  }, [chat]);

  const lastUserMessage = useMemo(() => [...chat.messages].reverse().find(m => m.role === 'user'), [chat.messages]);

  // Memoize handlers to maintain reference equality and prevent unnecessary re-renders of memoized components (Header, Sidebar, InputBar) during AI streaming token updates.
  const handleSend = useCallback((text: string) => {
    chat.sendMessage(text);
  }, [chat]);

  const handleRetry = useCallback(() => {
    if (lastUserMessage) {
      chat.sendMessage(lastUserMessage.content);
    }
  }, [lastUserMessage, chat]);

  const handleCloseSidebar = useCallback(() => {
    chat.setSidebarOpen(false);
  }, [chat]);

  const handleDismissError = useCallback(() => {
    chat.setError(null);
  }, [chat]);

  const handleDeleteAccount = useCallback(() => {
    chat.clearAllData();
    onSignOut();
  }, [chat, onSignOut]);

  const searchMatchCount = useMemo(
    () => chat.searchQuery.trim()
      ? chat.messages.filter(m => m.content.toLowerCase().includes(chat.searchQuery.toLowerCase())).length
      : 0,
    [chat.messages, chat.searchQuery],
  );

  return (
    <div className={`app${chat.sidebarOpen ? ' app--sidebar-open' : ''}`}>
      <Header
        searchOpen={chat.searchOpen}
        loading={chat.loading}
        hasMessages={chat.messages.length > 0}
        sidebarOpen={chat.sidebarOpen}
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
          onClose={handleCloseSidebar}
          userLabel={userLabel}
          isAdmin={isAdmin}
          onOpenAdmin={onOpenAdmin}
          onSignOut={onSignOut}
          theme={chat.theme}
          onToggleTheme={chat.toggleTheme}
          onClearLocalStorage={chat.clearAllData}
          onDeleteAccount={handleDeleteAccount}
          onRename={chat.renameSession}
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
              onDismissError={handleDismissError}
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
