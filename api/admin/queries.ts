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

interface UserQueryRow {
  id: string;
  user_id: string | null;
  query: string;
  source: 'primary' | 'brave';
  status: 'success' | 'error' | 'cancelled';
  session_id: string | null;
  created_at: string;
  profiles: { email: string | null; full_name: string | null } | null;
}

export default async function handler(req: any, res: any) {
  try {
    await requireAdmin(req.headers.authorization);

    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      json(res, 405, { error: 'Method not allowed.' });
      return;
    }

    const page = Math.max(Number(req.query?.page ?? 1) || 1, 1);
    const perPage = Math.min(Math.max(Number(req.query?.perPage ?? 50) || 50, 1), 200);
    const search = (req.query?.q as string | undefined)?.trim();
    const source = req.query?.source as string | undefined;

    const params: Record<string, string | number | undefined> = {
      select: 'id,user_id,query,source,status,session_id,created_at,profiles(email,full_name)',
      order: 'created_at.desc',
      limit: perPage,
      offset: (page - 1) * perPage,
    };
    if (search) {
      params.query = `ilike.*${search.replace(/[*/%?]/g, '')}*`;
    }
    if (source === 'primary' || source === 'brave') {
      params.source = `eq.${source}`;
    }

    const listResponse = await supabaseRequest('/rest/v1/user_queries', { method: 'GET' }, supabaseServiceRoleKey);
    if (!listResponse.ok) {
      throw new Error(`Failed to load queries (${listResponse.status}).`);
    }

    const rows = await listResponse.json() as UserQueryRow[];

    json(res, 200, {
      queries: rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        email: row.profiles?.email ?? null,
        fullName: row.profiles?.full_name ?? null,
        query: row.query,
        source: row.source,
        status: row.status,
        sessionId: row.session_id,
        createdAt: row.created_at,
      })),
      page,
      perPage,
    });
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
