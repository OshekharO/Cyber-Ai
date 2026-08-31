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

function json(res: { status: (code: number) => { json: (data: unknown) => void }; setHeader: (name: string, value: string) => void }, status: number, payload: unknown) {
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

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function requireAdmin(authorizationHeader: string | undefined) {
  const token = authorizationHeader?.startsWith('Bearer ')
    ? authorizationHeader.slice('Bearer '.length)
    : null;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new ApiError(500, 'Supabase server environment variables are missing.');
  }

  if (!token) {
    throw new ApiError(401, 'Missing bearer token.');
  }

  const userResponse = await supabaseRequest('/auth/v1/user', { method: 'GET' }, token);
  if (!userResponse.ok) {
    throw new ApiError(401, 'Unable to validate the current session.');
  }

  const user = await userResponse.json() as { id: string };
  const profileResponse = await supabaseRequest(`/rest/v1/profiles?select=id,role&id=eq.${user.id}`, { method: 'GET' }, token);
  if (!profileResponse.ok) {
    throw new ApiError(401, 'Unable to load the current profile.');
  }

  const profiles = await profileResponse.json() as Array<{ id: string; role: string }>;
  const profile = profiles[0];

  if (!profile || profile.role !== 'admin') {
    throw new ApiError(403, 'Admin access required.');
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

export default async function handler(req: { method: string; query?: Record<string, string>; headers: { authorization?: string } }, res: { status: (code: number) => { json: (data: unknown) => void }; setHeader: (name: string, value: string) => void }) {
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

    const queryParams = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString();
    const listResponse = await supabaseRequest(`/rest/v1/admin_audit_log?${queryParams}`, { method: 'GET' }, supabaseServiceRoleKey);
    if (!listResponse.ok) {
      throw new ApiError(500, `Failed to load audit log.`);
    }

    const rows = await listResponse.json() as AuditLogRow[];

    const adminIds = Array.from(new Set(rows.map((row) => row.admin_id).filter(Boolean)));
    const targetIds = Array.from(new Set(rows.map((row) => row.target_user_id).filter(Boolean)));
    const allIds = [...adminIds, ...targetIds];

    const profilesMap = new Map<string, { email: string | null; full_name: string | null }>();
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
    if (err instanceof ApiError) {
      json(res, err.status, { error: err.message });
    } else {
      console.error('Unhandled API Error:', err);
      json(res, 500, { error: 'Internal Server Error' });
    }
  }
}
