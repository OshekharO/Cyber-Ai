import { useState, type FormEvent } from 'react';
import { FiShield } from 'react-icons/fi';

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
          <div className="auth-brand-icon">
            <FiShield size={48} />
          </div>
          <div>
            <p className="auth-kicker">Cyber AI</p>
            <h1 className="auth-title">Sign in</h1>
          </div>
        </div>

        <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button type="button" className={`auth-tab${!isRegister ? ' auth-tab--active' : ''}`} onClick={() => setMode('login')} role="tab" aria-selected={!isRegister}>Login</button>
          <button type="button" className={`auth-tab${isRegister ? ' auth-tab--active' : ''}`} onClick={() => setMode('register')} role="tab" aria-selected={isRegister}>Register</button>
        </div>

        {activeError && <div className="auth-alert" role="alert">{activeError}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <label className="auth-field">
              <span>Name</span>
              <input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" required />
            </label>
          )}

          <label className="auth-field">
            <span>Email</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isRegister ? 'new-password' : 'current-password'} required minLength={8} />
          </label>

          {isRegister && (
            <label className="auth-field">
              <span>Confirm</span>
              <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required minLength={8} />
            </label>
          )}

          <button className="auth-submit" type="submit" disabled={loading || submitting}>{submitting ? 'Working...' : isRegister ? 'Create account' : 'Sign in'}</button>
        </form>

      </section>
    </main>
  );
}