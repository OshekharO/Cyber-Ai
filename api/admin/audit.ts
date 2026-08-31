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

interface AuditLogRow {
  id: string;
  admin_id: string;
  action: string;
  target_user_id: string;
  details: Record<string, unknown> | null;
  created_at: string;
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

    const params: Record<string, string | number | undefined> = {
      select: 'id,admin_id,action,target_user_id,details,created_at',
      order: 'created_at.desc',
      limit: perPage,
      offset: (page - 1) * perPage,
    };

    const listResponse = await supabaseRequest('/rest/v1/admin_audit_log', { method: 'GET' }, supabaseServiceRoleKey);
    if (!listResponse.ok) {
      throw new Error(`Failed to load audit log (${listResponse.status}).`);
    }

    const rows = await listResponse.json() as AuditLogRow[];

    const adminIds = Array.from(new Set(rows.map((row) => row.admin_id).filter(Boolean)));
    const targetIds = Array.from(new Set(rows.map((row) => row.target_user_id).filter(Boolean)));
    const allIds = [...adminIds, ...targetIds];

    let profilesMap = new Map<string, { email: string | null; full_name: string | null }>();
    if (allIds.length > 0) {
      const profilesResponse = await supabaseRequest(
        `/rest/v1/profiles?select=id,email,full_name&id=in.(${allIds.join(',')})`,
        { method: 'GET' },
        supabaseServiceRoleKey,
      );

      if (profilesResponse.ok) {
        const profiles = await profilesResponse.json() as Array<{ id: string; email: string | null; full_name: string | null }>;
        for (const profile of profiles) {
          profilesMap.set(profile.id, profile);
        }
      }
    }

    json(res, 200, {
      logs: rows.map((row) => ({
        id: row.id,
        adminId: row.admin_id,
        adminEmail: profilesMap.get(row.admin_id)?.email ?? null,
        adminName: profilesMap.get(row.admin_id)?.full_name ?? null,
        action: row.action,
        targetUserId: row.target_user_id,
        targetEmail: profilesMap.get(row.target_user_id)?.email ?? null,
        targetName: profilesMap.get(row.target_user_id)?.full_name ?? null,
        details: row.details,
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
