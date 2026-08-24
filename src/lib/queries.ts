import { buildSupabaseUrl, createSupabaseHeaders, isSupabaseConfigured } from './supabase.ts';
import type { QuerySource } from '../api/chat.ts';

export type QueryStatus = 'success' | 'error' | 'cancelled';

interface LogQueryInput {
  query: string;
  source: QuerySource;
  status: QueryStatus;
  /** Authenticated user id (must match the access token for RLS to allow insert). */
  userId?: string | null;
  sessionId?: string | null;
  /** User's Supabase access token so RLS resolves `auth.uid()`. */
  accessToken?: string | null;
}

/**
 * Records a user query in `public.user_queries`. Best-effort only: failures are
 * swallowed so analytics never break the chat experience. No-op when Supabase
 * is not configured.
 */
export async function logUserQuery(input: LogQueryInput): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { query, source, status, userId, sessionId, accessToken } = input;
  if (!query.trim()) return;

  try {
    await fetch(buildSupabaseUrl('rest/v1/user_queries'), {
      method: 'POST',
      headers: {
        ...createSupabaseHeaders(accessToken ?? undefined),
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        user_id: userId ?? null,
        query,
        source,
        status,
        session_id: sessionId ?? null,
      }),
    });
  } catch {
    // Logging must never interfere with the chat flow.
  }
}
