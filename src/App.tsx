import { useState, useCallback, useMemo } from 'react';
import { useChat } from './hooks/useChat.ts';
import { Header } from './components/Header.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { WelcomeScreen } from './components/WelcomeScreen.tsx';
import { MessageList } from './components/MessageList.tsx';
import { InputBar } from './components/InputBar.tsx';
import { MessageSearch } from './components/MessageSearch.tsx';
import './App.css';

export default function App() {
  const chat = useChat();
  const [input, setInput] = useState('');

  const lastUserMessage = useMemo(
    () => [...chat.messages].reverse().find(m => m.role === 'user'),
    [chat.messages],
  );

  const handleSend = useCallback((text: string) => {
    chat.sendMessage(text);
  }, [chat]);

  const handleRetry = useCallback(() => {
    if (lastUserMessage) {
      chat.sendMessage(lastUserMessage.content);
    }
  }, [chat, lastUserMessage]);

  const searchMatchCount = useMemo(
    () =>
      chat.searchQuery.trim()
        ? chat.messages.filter(m =>
            m.content.toLowerCase().includes(chat.searchQuery.toLowerCase())
          ).length
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
