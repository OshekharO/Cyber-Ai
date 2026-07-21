import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { LandingPage } from './components/LandingPage.tsx';
import { ChatWorkspace } from './components/ChatWorkspace.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { useAuth } from './hooks/useAuth.ts';
import './App.css';
import './components/LandingPage.css';

const WELCOME_SEEN_KEY = 'cyber-ai-welcome-seen';

export default function App() {
  const auth = useAuth();
  const [view, setView] = useState<'landing' | 'chat' | 'admin'>(() => {
    const hash = window.location.hash;
    if (hash === '#admin') return 'admin';
    if (hash === '#app') return 'chat';
    return 'landing';
  });
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
    const syncView = () => {
      const hash = window.location.hash;
      if (hash === '#admin') setView('admin');
      else if (hash === '#app') setView('chat');
      else setView('landing');
    };
    window.addEventListener('hashchange', syncView);
    return () => window.removeEventListener('hashchange', syncView);
  }, []);

  useEffect(() => {
    if (!auth.isAdmin && view === 'admin') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      setView('chat');
    }
  }, [auth.isAdmin, view]);

  const goToApp = () => {
    window.location.hash = 'app';
    setView('chat');
  };

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

  // Show landing page when not authenticated or explicitly on landing view
  if (view === 'landing' || !auth.session) {
    return (
      <>
        <LandingPage onGetStarted={goToApp} />
        <Analytics />
      </>
    );
  }

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
        isAdmin={auth.isAdmin}
        onOpenAdmin={openAdmin}
        onSignOut={signOut}
      />
      <Analytics />
    </>
  );
}
