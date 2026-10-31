import { useState, type FormEvent } from 'react';
import { FiShield } from 'react-icons/fi';
import { isBlacklistedEmail } from '../hooks/useAuth.ts';

interface AuthScreenProps {
  loading: boolean;
  error: string | null;
  configError: string | null;
  isRecoveryMode?: boolean;
  onSignIn: (input: { email: string; password: string }) => Promise<void>;
  onSignUp: (input: { email: string; password: string; fullName: string }) => Promise<void>;
  onResetPassword?: (email: string) => Promise<void>;
  onUpdatePassword?: (password: string) => Promise<void>;
}

type Mode = 'login' | 'register' | 'forgot' | 'reset';

export function AuthScreen({
  loading,
  error,
  configError,
  isRecoveryMode = false,
  onSignIn,
  onSignUp,
  onResetPassword,
  onUpdatePassword,
}: AuthScreenProps) {
  const [mode, setMode] = useState<Mode>(isRecoveryMode ? 'reset' : 'login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const activeError = localError ?? error ?? configError;
  const isRegister = mode === 'register';
  const isForgot = mode === 'forgot';
  const isReset = mode === 'reset' || isRecoveryMode;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);
    setNotice(null);

    if (isForgot) {
      if (!onResetPassword) {
        setLocalError('Password reset is not configured.');
        return;
      }
      setSubmitting(true);
      try {
        await onResetPassword(email.trim());
        setNotice('If an account exists with this email, a password reset link has been sent. Please check your inbox.');
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Failed to send password reset email.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (isReset) {
      if (!onUpdatePassword) {
        setLocalError('Password update is not configured.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match.');
        return;
      }
      setSubmitting(true);
      try {
        await onUpdatePassword(password);
        setNotice('Password updated successfully! You can now sign in with your new password.');
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Failed to update password.');
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

  const getTitle = () => {
    if (isReset) return 'Set new password';
    if (isForgot) return 'Reset password';
    if (isRegister) return 'Create account';
    return 'Sign in';
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
            <h1 className="auth-title">{getTitle()}</h1>
          </div>
        </div>

        {!isForgot && !isReset && (
          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              className={`auth-tab${!isRegister ? ' auth-tab--active' : ''}`}
              onClick={() => { setMode('login'); setLocalError(null); setNotice(null); }}
              role="tab"
              aria-selected={!isRegister}
            >
              Login
            </button>
            <button
              type="button"
              className={`auth-tab${isRegister ? ' auth-tab--active' : ''}`}
              onClick={() => { setMode('register'); setLocalError(null); setNotice(null); }}
              role="tab"
              aria-selected={isRegister}
            >
              Register
            </button>
          </div>
        )}

        {notice && (
          <div className="auth-alert auth-alert--info" role="status">
            {notice}
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

          {!isReset && (
            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                placeholder={isForgot ? 'Enter your registered email' : undefined}
              />
            </label>
          )}

          {!isForgot && (
            <label className="auth-field">
              <div className="auth-field-header">
                <span>{isReset ? 'New Password' : 'Password'}</span>
                {mode === 'login' && (
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => {
                      setMode('forgot');
                      setLocalError(null);
                      setNotice(null);
                    }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={isRegister || isReset ? 'new-password' : 'current-password'}
                required
                minLength={8}
              />
            </label>
          )}

          {(isRegister || isReset) && (
            <label className="auth-field">
              <span>{isReset ? 'Confirm New Password' : 'Confirm'}</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
              />
            </label>
          )}

          <button className="auth-submit" type="submit" disabled={loading || submitting}>
            {submitting
              ? 'Working...'
              : isForgot
              ? 'Send reset link'
              : isReset
              ? 'Update password'
              : isRegister
              ? 'Create account'
              : 'Sign in'}
          </button>

          {(isForgot || isReset) && (
            <div className="auth-actions-center">
              <button
                type="button"
                className="auth-secondary-btn"
                onClick={() => {
                  setMode('login');
                  setLocalError(null);
                  setNotice(null);
                }}
              >
                Back to sign in
              </button>
            </div>
          )}
        </form>

      </section>
    </main>
  );
}