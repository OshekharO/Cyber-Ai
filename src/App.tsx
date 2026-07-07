import { useEffect, useState } from 'react';
import { AuthScreen } from './components/AuthScreen.tsx';
import { ChatWorkspace } from './components/ChatWorkspace.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { useAuth } from './hooks/useAuth.ts';
import { supabaseConfigError } from './lib/supabase.ts';
import './App.css';

export default function App() {
  const auth = useAuth();
  const [view, setView] = useState<'chat' | 'admin'>(() => window.location.hash === '#admin' ? 'admin' : 'chat');

  useEffect(() => {
    const syncView = () => setView(window.location.hash === '#admin' ? 'admin' : 'chat');
    window.addEventListener('hashchange', syncView);
    return () => window.removeEventListener('hashchange', syncView);
  }, []);

  useEffect(() => {
    if (!auth.isAdmin && view === 'admin') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      setView('chat');
    }
  }, [auth.isAdmin, view]);

  const openAdmin = () => {
    window.location.hash = 'admin';
    setView('admin');
  };

  const backToChat = () => {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    setView('chat');
  };

  const signOut = async () => {
    await auth.signOut();
    backToChat();
  };

  if (auth.loading) {
    return (
      <main className="screen-shell screen-shell--loading">
        <div className="loading-card">
          <div className="loading-orb" aria-hidden="true" />
          <p>Loading secure workspace...</p>
        </div>
      </main>
    );
  }

  if (!auth.session) {
    return (
      <AuthScreen
        loading={auth.loading}
        error={auth.error}
        configError={auth.error === supabaseConfigError ? auth.error : null}
        onSignIn={auth.signIn}
        onSignUp={auth.signUp}
      />
    );
  }

  if (view === 'admin' && auth.isAdmin && auth.profile) {
    return (
      <AdminDashboard
        session={auth.session}
        profile={auth.profile}
        onBackToChat={backToChat}
        onSignOut={signOut}
        notice={auth.error}
      />
    );
  }

  return (
    <ChatWorkspace
      userId={auth.user?.id ?? 'guest'}
      userLabel={auth.profile?.full_name ?? auth.user?.email ?? 'Account'}
      isAdmin={auth.isAdmin}
      onOpenAdmin={openAdmin}
      onSignOut={signOut}
    />
  );
}
