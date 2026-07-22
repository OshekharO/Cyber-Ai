import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { AuthScreen } from './components/AuthScreen.tsx';
import { ChatWorkspace } from './components/ChatWorkspace.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { useAuth } from './hooks/useAuth.ts';
import { supabaseConfigError } from './lib/supabase.ts';
import './App.css';

const WELCOME_SEEN_KEY = 'cyber-ai-welcome-seen';

export default function App() {
  const auth = useAuth();
  const [view, setView] = useState<'chat' | 'admin'>(() => window.location.hash === '#admin' ? 'admin' : 'chat');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem(WELCOME_SEEN_KEY);
    if (!hasSeen && auth.session) {
      setShowWelcomeModal(true);
    }
  }, [auth.session]);

  const dismissWelcomeModal = () => {
    localStorage.setItem(WELCOME_SEEN_KEY, 'true');
    setShowWelcomeModal(false);
  };

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

  const handleDeleteAccount = async () => {
    if (auth.session?.access_token) {
      try {
        // Call Supabase to delete the user account
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/user`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${auth.session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete account');
        }
        
        // Sign out after successful deletion
        await auth.signOut();
        backToChat();
      } catch (error) {
        console.error('Failed to delete account:', error);
        alert('Failed to delete account. Please try again.');
      }
    }
  };

  const welcomeModal = showWelcomeModal ? (
    <div className="welcome-modal-overlay" onClick={dismissWelcomeModal}>
      <div className="welcome-modal" onClick={(e) => e.stopPropagation()}>
        <div className="welcome-modal-icon" aria-hidden="true">🛡️</div>
        <h2 className="welcome-modal-title">Welcome to Cyber AI</h2>
        <p className="welcome-modal-message">
          This project is for <strong>educational purposes</strong> — built to help cybersecurity
          professionals, students, and enthusiasts learn and explore security concepts.
        </p>
        <p className="welcome-modal-credit">
          <strong>Built with ❤️ for the cybersecurity community.</strong>
          <br />
          by <span className="welcome-modal-author">Saksham Shekher</span> and{' '}
          <span className="welcome-modal-author">Ayan Kar</span>
        </p>
        <button className="welcome-modal-btn" onClick={dismissWelcomeModal}>
          Get Started
        </button>
      </div>
    </div>
  ) : null;

  if (auth.loading) {
    return (
      <>
        {welcomeModal}
        <main className="screen-shell screen-shell--loading">
          <div className="loading-card">
            <div className="loading-orb" aria-hidden="true" />
            <p>Loading secure workspace...</p>
          </div>
        </main>
        <Analytics />
      </>
    );
  }

  if (!auth.session) {
    return (
      <>
        {welcomeModal}
        <AuthScreen
          loading={auth.loading}
          error={auth.error}
          configError={auth.error === supabaseConfigError ? auth.error : null}
          onSignIn={auth.signIn}
          onSignUp={auth.signUp}
        />
        <Analytics />
      </>
    );
  }

  if (view === 'admin' && auth.isAdmin && auth.profile) {
    return (
      <>
        {welcomeModal}
        <AdminDashboard
          session={auth.session}
          profile={auth.profile}
          onBackToChat={backToChat}
          onSignOut={signOut}
          notice={auth.error}
        />
        <Analytics />
      </>
    );
  }

  return (
    <>
      {welcomeModal}
      <ChatWorkspace
        userId={auth.user?.id ?? 'guest'}
        userLabel={auth.profile?.full_name ?? (auth.user?.user_metadata.full_name as string | undefined) ?? (auth.user?.user_metadata.name as string | undefined) ?? auth.user?.email?.split('@')[0] ?? 'Account'}
        userEmail={auth.user?.email}
        isAdmin={auth.isAdmin}
        onOpenAdmin={openAdmin}
        onSignOut={signOut}
        onDeleteAccount={handleDeleteAccount}
      />
      <Analytics />
    </>
  );
}
