import { useState, type FormEvent } from 'react';
import { FiShield } from 'react-icons/fi';
import { isBlacklistedEmail } from '../hooks/useAuth.ts';

interface AuthScreenProps {
  loading: boolean;
  error: string | null;
  configError: string | null;
  onSignIn: (input: { email: string; password: string }) => Promise<void>;
  onSignUp: (input: { email: string; password: string; fullName: string }) => Promise<void>;
  onResetPassword?: (email: string) => Promise<void>;
}

type Mode = 'login' | 'register' | 'forgot';

export function AuthScreen({ loading, error, configError, onSignIn, onSignUp, onResetPassword }: AuthScreenProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const activeError = localError ?? error ?? configError;
  const isRegister = mode === 'register';
  const isForgot = mode === 'forgot';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);

    if (isForgot) {
      if (!onResetPassword) {
        setLocalError('Password reset is not configured.');
        return;
      }

      setSubmitting(true);
      try {
        await onResetPassword(email.trim());
        setSuccessMessage('Password reset email sent. Check your inbox for instructions.');
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Password reset failed.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (isRegister && isBlacklistedEmail(email)) {
      setLocalError('Registration from this email domain is not allowed.');
      return;
    }

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

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setLocalError(null);
    setSuccessMessage(null);
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
            <h1 className="auth-title">
              {isForgot ? 'Reset password' : isRegister ? 'Create account' : 'Sign in'}
            </h1>
          </div>
        </div>

        {!isForgot ? (
          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              className={`auth-tab${!isRegister ? ' auth-tab--active' : ''}`}
              onClick={() => handleModeChange('login')}
              role="tab"
              aria-selected={!isRegister}
            >
              Login
            </button>
            <button
              type="button"
              className={`auth-tab${isRegister ? ' auth-tab--active' : ''}`}
              onClick={() => handleModeChange('register')}
              role="tab"
              aria-selected={isRegister}
            >
              Register
            </button>
          </div>
        ) : (
          <p style={{ margin: '1rem 0 0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary, #94a3b8)' }}>
            Enter your email address and we will send you instructions to reset your password.
          </p>
        )}

        {successMessage && (
          <div className="auth-alert auth-alert--info" role="status">
            {successMessage}
          </div>
        )}

        {activeError && (
          <div
            className={`auth-alert${
              activeError.toLowerCase().includes('successful') || activeError.toLowerCase().includes('check your email')
                ? ' auth-alert--info'
                : ' auth-alert--error'
            }`}
            role="alert"
          >
            {activeError}
          </div>
        )}

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

          {!isForgot && (
            <label className="auth-field">
              <span>Password</span>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isRegister ? 'new-password' : 'current-password'} required minLength={8} />
            </label>
          )}

          {isRegister && (
            <label className="auth-field">
              <span>Confirm</span>
              <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required minLength={8} />
            </label>
          )}

          {!isRegister && !isForgot && (
            <div style={{ textAlign: 'right', marginTop: '-0.25rem', marginBottom: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleModeChange('forgot')}
                style={{ background: 'none', border: 'none', color: 'var(--accent, #38bdf8)', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
              >
                Forgot password?
              </button>
            </div>
          )}

          <button className="auth-submit" type="submit" disabled={loading || submitting}>
            {submitting ? 'Working...' : isForgot ? 'Send reset email' : isRegister ? 'Create account' : 'Sign in'}
          </button>

          {isForgot && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                style={{ background: 'none', border: 'none', color: 'var(--accent, #38bdf8)', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
              >
                Back to Sign in
              </button>
            </div>
          )}
        </form>
      </section>
    </main>
  );
}
