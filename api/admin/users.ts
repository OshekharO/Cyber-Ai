const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

function buildUrl(path: string, query?: Record<string, string | number | undefined>) {
  const url = new URL(`${supabaseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url;
}

function json(res: any, status: number, payload: unknown) {
  res.status(status).json(payload);
}

async function supabaseRequest(path: string, init: RequestInit = {}, token?: string) {
  return fetch(buildUrl(path), {
    ...init,
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${token ?? supabaseServiceRoleKey}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
}

async function requireAdmin(authorizationHeader: string | undefined) {
  const token = authorizationHeader?.startsWith('Bearer ')
    ? authorizationHeader.slice('Bearer '.length)
    : null;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase server environment variables are missing.');
  }

  if (!token) {
    throw new Error('Missing bearer token.');
  }

  const userResponse = await supabaseRequest('/auth/v1/user', { method: 'GET' }, token);
  if (!userResponse.ok) {
    throw new Error('Unable to validate the current session.');
  }

  const user = await userResponse.json() as { id: string };
  const profileResponse = await supabaseRequest(`/rest/v1/profiles?select=id,role&id=eq.${user.id}`, { method: 'GET' }, token);
  if (!profileResponse.ok) {
    throw new Error('Unable to load the current profile.');
  }

  const profiles = await profileResponse.json() as Array<{ id: string; role: string }>;
  const profile = profiles[0];

  if (!profile || profile.role !== 'admin') {
    throw new Error('Admin access required.');
  }

  return { user, profile };
}

export default async function handler(req: any, res: any) {
  try {
    await requireAdmin(req.headers.authorization);
    const body = typeof req.body === 'string'
      ? JSON.parse(req.body)
      : req.body ?? {};

    if (req.method === 'GET') {
      const page = Math.max(Number(req.query?.page ?? 1) || 1, 1);
      const perPage = Math.min(Math.max(Number(req.query?.perPage ?? 100) || 100, 1), 200);

      const listResponse = await supabaseRequest('/auth/v1/admin/users', { method: 'GET' }, supabaseServiceRoleKey);
      if (!listResponse.ok) {
        throw new Error(`Failed to load users (${listResponse.status}).`);
      }

      const listPayload = await listResponse.json() as { users?: Array<any> };
      const users = (listPayload.users ?? []).slice((page - 1) * perPage, page * perPage);
      const ids = users.map((user) => user.id);

      if (ids.length === 0) {
        json(res, 200, { users: [] });
        return;
      }

      const profilesResponse = await supabaseRequest(
        `/rest/v1/profiles?select=id,email,full_name,role,created_at,updated_at&id=in.(${ids.join(',')})`,
        { method: 'GET' },
        supabaseServiceRoleKey,
      );

      if (!profilesResponse.ok) {
        throw new Error(`Failed to load profiles (${profilesResponse.status}).`);
      }

      const profiles = await profilesResponse.json() as Array<{ id: string; email: string | null; full_name: string | null; role: 'user' | 'admin'; created_at: string; updated_at: string }>;
      const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));

      json(res, 200, {
        users: users.map((user: any) => {
          const profile = profileMap.get(user.id);
          return {
            id: user.id,
            email: user.email ?? profile?.email ?? null,
            full_name: profile?.full_name ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
            role: profile?.role ?? 'user',
            created_at: profile?.created_at ?? user.created_at,
            last_sign_in_at: user.last_sign_in_at ?? null,
            confirmed_at: user.confirmed_at ?? null,
          };
        }),
      });
      return;
    }

    if (req.method === 'PATCH') {
      const { userId, role } = body as { userId?: string; role?: 'user' | 'admin' };
      if (!userId || (role !== 'user' && role !== 'admin')) {
        json(res, 400, { error: 'Provide userId and a valid role.' });
        return;
      }

      const profileResponse = await supabaseRequest(
        `/rest/v1/profiles?id=eq.${userId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ role, updated_at: new Date().toISOString() }),
        },
        supabaseServiceRoleKey,
      );

      if (!profileResponse.ok) {
        throw new Error(`Failed to update user profile (${profileResponse.status}).`);
      }

      const authResponse = await supabaseRequest(
        `/auth/v1/admin/users/${userId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ app_metadata: { role } }),
        },
        supabaseServiceRoleKey,
      );

      if (!authResponse.ok) {
        throw new Error(`Failed to update auth user (${authResponse.status}).`);
      }

      json(res, 200, { ok: true });
      return;
    }

    if (req.method === 'DELETE') {
      const { userId } = body as { userId?: string };
      if (!userId) {
        json(res, 400, { error: 'Provide userId.' });
        return;
      }

      const authResponse = await supabaseRequest(`/auth/v1/admin/users/${userId}`, { method: 'DELETE' }, supabaseServiceRoleKey);
      if (!authResponse.ok) {
        throw new Error(`Failed to delete user (${authResponse.status}).`);
      }

      json(res, 200, { ok: true });
      return;
    }

    res.setHeader('Allow', 'GET, PATCH, DELETE');
    json(res, 405, { error: 'Method not allowed.' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unauthorized.';
    const status = message.includes('Supabase server environment variables are missing')
      ? 500
      : message.includes('Admin access required')
        ? 403
        : message.includes('Missing bearer token')
          ? 401
          : message.includes('Unable to validate the current session')
            ? 401
            : 500;

    json(res, status, { error: message });
  }
}