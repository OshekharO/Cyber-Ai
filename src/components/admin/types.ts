export interface AdminUser {
  id: string;
  email: string | null;
  full_name: string | null;
  role: 'user' | 'admin';
  created_at: string;
  last_sign_in_at: string | null;
  confirmed_at: string | null;
}

export interface AdminQuery {
  id: string;
  userId: string | null;
  email: string | null;
  fullName: string | null;
  query: string;
  source: 'primary' | 'brave';
  status: 'success' | 'error' | 'cancelled';
  sessionId: string | null;
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminEmail: string | null;
  adminName: string | null;
  action: string;
  targetUserId: string;
  targetEmail: string | null;
  targetName: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}

export type AdminTab = 'users' | 'queries' | 'audit';
