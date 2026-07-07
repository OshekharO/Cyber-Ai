import { useCallback, useEffect, useState } from 'react';
import {
  buildSupabaseUrl,
  createSupabaseHeaders,
  isSupabaseConfigured,
  parseJson,
  readStoredSession,
  supabaseConfigError,
  type SupabaseAuthUser,
  type SupabaseSession,
  writeStoredSession,
} from '../lib/supabase.ts';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

interface SignInInput {
  email: string;
  password: string;
}

interface SignUpInput extends SignInInput {
  fullName: string;
}

const SESSION_KEY = 'cyber-ai-supabase-session';

async function authRequest<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(buildSupabaseUrl(path), {
    ...init,
    headers: {
      ...createSupabaseHeaders(token),
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed (${response.status}).`);
  }

  return parseJson<T>(response);
}

async function signInWithPassword(email: string, password: string) {
  return authRequest<Partial<SupabaseSession>>('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

async function signUpWithPassword(email: string, password: string, fullName: string) {
  return authRequest<Partial<SupabaseSession>>('/auth/v1/signup', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      options: { data: { full_name: fullName } },
    }),
  });
}

async function refreshAuthSession(refreshToken: string) {
  return authRequest<Partial<SupabaseSession>>('/auth/v1/token?grant_type=refresh_token', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

async function getCurrentUser(accessToken: string) {
  return authRequest<SupabaseAuthUser>('/auth/v1/user', { method: 'GET' }, accessToken);
}

async function signOutSession(accessToken: string) {
  try {
    await authRequest('/auth/v1/logout', { method: 'POST' }, accessToken);
  } catch {
    // Clear local state even if remote sign-out fails.
  }
}

async function readProfile(accessToken: string, userId: string): Promise<Profile | null> {
  const response = await fetch(buildSupabaseUrl('rest/v1/profiles', {
    select: 'id,email,full_name,role,created_at,updated_at',
    id: `eq.${userId}`,
    limit: 1,
  }), {
    method: 'GET',
    headers: createSupabaseHeaders(accessToken),
  });

  if (!response.ok) {
    throw new Error(`Failed to load profile (${response.status}).`);
  }

  const rows = await parseJson<Profile[]>(response);
  return rows[0] ?? null;
}

async function createProfile(accessToken: string, user: SupabaseAuthUser): Promise<Profile> {
  const fullName = (user.user_metadata.full_name as string | undefined)
    ?? (user.user_metadata.name as string | undefined)
    ?? user.email;

  const response = await fetch(buildSupabaseUrl('rest/v1/profiles'), {
    method: 'POST',
    headers: {
      ...createSupabaseHeaders(accessToken),
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      id: user.id,
      email: user.email,
      full_name: fullName,
      role: 'user',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create profile (${response.status}).`);
  }

  const rows = await parseJson<Profile[]>(response);
  if (!rows[0]) {
    throw new Error('Profile creation returned no data.');
  }

  return rows[0];
}

async function syncProfile(accessToken: string, user: SupabaseAuthUser): Promise<Profile> {
  const existing = await readProfile(accessToken, user.id);
  if (!existing) {
    return createProfile(accessToken, user);
  }

  const nextFullName = (user.user_metadata.full_name as string | undefined)
    ?? (user.user_metadata.name as string | undefined)
    ?? existing.full_name;

  if (existing.email === user.email && existing.full_name === nextFullName) {
    return existing;
  }

  const response = await fetch(buildSupabaseUrl('rest/v1/profiles', { id: `eq.${user.id}` }), {
    method: 'PATCH',
    headers: createSupabaseHeaders(accessToken),
    body: JSON.stringify({
      email: user.email,
      full_name: nextFullName,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update profile (${response.status}).`);
  }

  const rows = await parseJson<Profile[]>(response);
  return rows[0] ?? existing;
}

function toSession(payload: Partial<SupabaseSession>): SupabaseSession | null {
  if (!payload.access_token || !payload.refresh_token || !payload.user) {
    return null;
  }

  const expiresIn = payload.expires_in ?? 3600;
  return {
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
    expires_in: expiresIn,
    expires_at: payload.expires_at ?? Math.floor(Date.now() / 1000) + expiresIn,
    token_type: payload.token_type ?? 'bearer',
    user: payload.user,
  };
}

export function useAuth() {
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(isSupabaseConfigured ? null : supabaseConfigError);

  const commitSession = useCallback((nextSession: SupabaseSession | null) => {
    setSession(nextSession);
    writeStoredSession(SESSION_KEY, nextSession);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session) return null;
    const nextProfile = await syncProfile(session.access_token, session.user);
    setProfile(nextProfile);
    setError(null);
    return nextProfile;
  }, [session]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      setError(supabaseConfigError);
      return;
    }

    let mounted = true;

    const bootstrap = async () => {
      const stored = readStoredSession(SESSION_KEY);
      if (!stored) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const user = await getCurrentUser(stored.access_token);
        if (!mounted) return;

        const nextSession = { ...stored, user } satisfies SupabaseSession;
        commitSession(nextSession);
        const nextProfile = await syncProfile(nextSession.access_token, nextSession.user);
        if (mounted) {
          setProfile(nextProfile);
          setError(null);
        }
      } catch {
        if (!stored.refresh_token) {
          commitSession(null);
          setProfile(null);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        try {
          const refreshed = await refreshAuthSession(stored.refresh_token);
          const nextSession = toSession(refreshed);
          if (!nextSession) {
            throw new Error('Authentication session is incomplete.');
          }

          const user = await getCurrentUser(nextSession.access_token);
          nextSession.user = user;
          commitSession(nextSession);
          const nextProfile = await syncProfile(nextSession.access_token, user);
          if (mounted) {
            setProfile(nextProfile);
            setError(null);
          }
        } catch {
          commitSession(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, [commitSession]);

  const signIn = useCallback(async ({ email, password }: SignInInput) => {
    if (!isSupabaseConfigured) {
      throw new Error(supabaseConfigError);
    }

    const payload = await signInWithPassword(email, password);
    const nextSession = toSession(payload);
    if (!nextSession) {
      throw new Error('Login succeeded but no session was returned.');
    }

    const user = await getCurrentUser(nextSession.access_token);
    nextSession.user = user;
    commitSession(nextSession);
    const nextProfile = await syncProfile(nextSession.access_token, user);
    setProfile(nextProfile);
    setError(null);
  }, [commitSession]);

  const signUp = useCallback(async ({ email, password, fullName }: SignUpInput) => {
    if (!isSupabaseConfigured) {
      throw new Error(supabaseConfigError);
    }

    const payload = await signUpWithPassword(email, password, fullName);
    const nextSession = toSession(payload);
    if (!nextSession) {
      setError('Registration successful. Check your email to confirm your account, then sign in.');
      return;
    }

    const user = await getCurrentUser(nextSession.access_token);
    nextSession.user = user;
    commitSession(nextSession);
    const nextProfile = await syncProfile(nextSession.access_token, user);
    setProfile(nextProfile);
    setError(null);
  }, [commitSession]);

  const signOut = useCallback(async () => {
    if (!session) {
      commitSession(null);
      setProfile(null);
      return;
    }

    if (isSupabaseConfigured) {
      await signOutSession(session.access_token);
    }

    commitSession(null);
    setProfile(null);
    setError(null);
  }, [commitSession, session]);

  return {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    error,
    isAdmin: profile?.role === 'admin',
    signIn,
    signUp,
    signOut,
    refreshProfile,
    clearError: () => setError(null),
  };
}