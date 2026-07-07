import { useState, type FormEvent } from 'react';

interface AuthScreenProps {
  loading: boolean;
  error: string | null;
  configError: string | null;
  onSignIn: (input: { email: string; password: string }) => Promise<void>;
  onSignUp: (input: { email: string; password: string; fullName: string }) => Promise<void>;
}

type Mode = 'login' | 'register';

export function AuthScreen({ loading, error, configError, onSignIn, onSignUp }: AuthScreenProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const activeError = localError ?? error ?? configError;
  const isRegister = mode === 'register';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (isRegister && password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        await onSignUp({ email: email.trim(), password, fullName: fullName.trim() });
      } else {
        await onSignIn({ email: email.trim(), password });
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="screen-shell auth-shell">
      <section className="auth-card">
        <div className="auth-brand-block">
          <div className="auth-brand-icon">🛡️</div>
          <div>
            <p className="auth-kicker">Cyber AI secure access</p>
            <h1 className="auth-title">Login and registration for users, with admin control built in.</h1>
          </div>
        </div>

        <p className="auth-copy">
          Supabase handles authentication and PostgreSQL storage. Admins get a protected dashboard to manage users and roles.
        </p>

        <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button type="button" className={`auth-tab${!isRegister ? ' auth-tab--active' : ''}`} onClick={() => setMode('login')} role="tab" aria-selected={!isRegister}>Login</button>
          <button type="button" className={`auth-tab${isRegister ? ' auth-tab--active' : ''}`} onClick={() => setMode('register')} role="tab" aria-selected={isRegister}>Register</button>
        </div>

        {activeError && <div className="auth-alert" role="alert">{activeError}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <label className="auth-field">
              <span>Full name</span>
              <input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your name" autoComplete="name" required />
            </label>
          )}

          <label className="auth-field">
            <span>Email</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" autoComplete="email" required />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" autoComplete={isRegister ? 'new-password' : 'current-password'} required minLength={8} />
          </label>

          {isRegister && (
            <label className="auth-field">
              <span>Confirm password</span>
              <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat password" autoComplete="new-password" required minLength={8} />
            </label>
          )}

          <button className="auth-submit" type="submit" disabled={loading || submitting}>{submitting ? 'Working...' : isRegister ? 'Create account' : 'Sign in'}</button>
        </form>

        <p className="auth-footnote">
          {isRegister
            ? 'New accounts start as users. Promote trusted accounts to admin in the dashboard or directly in Supabase.'
            : 'Sign in to access your personal chat workspace. Admins can switch into the dashboard after authentication.'}
        </p>
      </section>
    </main>
  );
}