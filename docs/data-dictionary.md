# 📊 Data Dictionary — Cyber AI

> **Database:** PostgreSQL (via Supabase)  
> **Schema file:** [`supabase/schema.sql`](../supabase/schema.sql)  
> **Last updated:** 2026-08-25  
> **Application:** Cyber AI — an AI-powered cybersecurity assistant

> 📝 *Note: This data dictionary was inferred from the actual codebase (`supabase/schema.sql`, `src/hooks/`, `api/admin/`). The attached reference images could not be viewed, so the format follows a standard table-per-entity layout with full column details, constraints, indexes, RLS policies, and an application-to-database mapping.*

## Overview

Cyber AI uses **Supabase** as its backend-as-a-service, providing a managed
PostgreSQL database. The schema consists of three tables across two schemas:

| # | Schema     | Table          | Owner         | Purpose                                                    |
|---|-----------|----------------|---------------|------------------------------------------------------------|
| 1 | `auth`    | `users`        | Supabase Auth | Managed identity / authentication table (not user-defined). |
| 2 | `public`  | `profiles`     | Application   | Extended user profile with display name and role.           |
| 3 | `public`  | `user_queries` | Application   | Audit log of queries submitted by users to the AI backend.  |

**Relationship summary:**
## Table 1 — `public.profiles`

> **Source:** `supabase/schema.sql`. Rows are created automatically by the
> `handle_new_user()` trigger after a new `auth.users` row is inserted.

| Field Name    | Data Type & Constraints                                           | Description / Business Context                                                                    |
|---------------|-------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| `id`          | `UUID` — PK, FK → `auth.users(id)`, `ON DELETE CASCADE`          | Unique ID that matches the Supabase Auth user.                                                   |
| `email`       | `Text` — nullable                                                 | User's email address, copied from `auth.users` at signup.                                                 |
| `full_name`   | `Text` — nullable                                                 | User's full name, extracted from `raw_user_meta_data` (`full_name` or `name` key).                  |
| `role`        | `Text` — `NOT NULL`, default `'user'`, check `role IN ('user','admin')` | Authorization role. `'user'` = standard access; `'admin'` = access to admin dashboard & query logs. |
| `created_at`  | `Timestamptz` — `NOT NULL`, default `now()`                      | Timestamp of profile creation.                                                                 |
| `updated_at`  | `Timestamptz` — `NOT NULL`, default `now()`                      | Timestamp of last profile update; **auto-updated** by `set_updated_at()` trigger on every `UPDATE`. |

**Indexes:**

| Index Name            | Columns | Type | Notes                                              |
|-----------------------|---------|------|----------------------------------------------------|
| `profiles_pkey`       | `id`    | PK   | Primary key.                                       |
| `profiles_id_fkey`    | `id`    | FK   | Foreign key → `auth.users(id)`, `ON DELETE CASCADE`. |

**Row-Level Security (RLS):** Enabled. Users can read/insert/update only their own profile (`auth.uid() = id`); admins can read/update any profile (`public.is_admin()`).

**Triggers:**
- `profiles_set_updated_at` — `BEFORE UPDATE` on `profiles`, calls `public.set_updated_at()` → sets `new.updated_at = now()`.
- `on_auth_user_created` — `AFTER INSERT` on `auth.users`, calls `public.handle_new_user()` → inserts/updates the matching `profiles` row via `ON CONFLICT ... DO UPDATE`.

**Application Mapping** (from `src/hooks/useAuth.ts` — `Profile` interface):
## Table 2 — `public.user_queries`

> **Source:** `supabase/schema.sql`. Records every query a user submits to the AI
> backend (or the Brave fallback), for analytics and admin review.

| Field Name    | Data Type & Constraints                                                          | Description / Business Context                                                                   |
|---------------|-----------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| `id`          | `UUID` — PK, default `gen_random_uuid()`                                          | Unique ID for each logged query.                                                                    |
| `user_id`     | `UUID` — FK → `profiles(id)`, `ON DELETE SET NULL`, nullable                    | User who made the query. Set to `NULL` if the user is deleted (row preserved for audit).          |
| `query`       | `Text` — `NOT NULL`                                                              | The question asked by the user.                                                                   |
| `source`      | `Text` — `NOT NULL`, default `'primary'`, check `source IN ('primary','brave')`   | Which backend answered: `'primary'` = main AI API; `'brave'` = Brave Search fallback.            |
| `status`      | `Text` — `NOT NULL`, default `'success'`, check `status IN ('success','error','cancelled')` | Outcome: `'success'` (got response), `'error'` (backend failed), `'cancelled'` (user aborted). |
| `session_id`  | `Text` — nullable                                                                | Client-side chat session identifier (from localStorage); links queries across a conversation.    |
| `created_at`  | `Timestamptz` — `NOT NULL`, default `now()`                                      | Timestamp the query was logged (server `now()`).                                                  |

**Indexes:**

| Index Name                | Columns        | Type | Notes                        |
|---------------------------|----------------|------|------------------------------|
| `user_queries_pkey`       | `id`           | PK   | Primary key.                 |
| `user_queries_user_id_fkey` | `user_id`    | FK   | Foreign key → `profiles(id)`. |
| `user_queries_user_id_idx` | `user_id`     | Idx  | Optimizes per-user lookups.  |
| `user_queries_created_at_idx` | `created_at DESC` | Idx | Optimizes chronological queries. |

**Row-Level Security (RLS):** Enabled.
- **INSERT:** Authenticated users may insert only their own queries (`auth.uid() = user_id`). Insert is best-effort — failures are silently swallowed (`src/lib/queries.ts`).
- **SELECT:** **Admins only** (`public.is_admin()`). Regular users cannot read this table.

**Insert path:** `src/lib/queries.ts` → `logUserQuery()` → `POST /rest/v1/user_queries` with the user's access token (so RLS resolves `auth.uid()`).

**Read path:** `api/admin/queries.ts` reads the table using the `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS). Supports `page`, `perPage`, `q` (ilike search on `query`), and `source` filters.

**Application Mapping** (from `src/components/AdminDashboard.tsx` — `AdminQuery` interface):

| App Property  | DB Column                | TS Type                              |
|---------------|--------------------------|--------------------------------------|
## Table 3 — `auth.users` (Supabase-managed)

> **Source:** Supabase Auth (not user-defined). Supabase creates and maintains
> this table. The application reads the following columns via the Admin API and REST API.

| Field Name             | Data Type & Constraints   | Description                                                                                  |
|------------------------|---------------------------|----------------------------------------------------------------------------------------------|
| `id`                   | `UUID` — primary key      | Unique user ID; matches `profiles.id` via FK.                                                |
| `email`                | `String` — unique         | User's email address.                                                                        |
| `encrypted_password`   | `String`                  | Supabase-encrypted password hash.                                                            |
| `raw_user_meta_data`   | `JSONB`                   | Signup metadata (e.g. `full_name`, `name`). Used by `handle_new_user()` to populate `full_name`. |
| `app_metadata`         | `JSONB`                   | Application metadata (e.g. `role` — written by admin PATCH via `/auth/v1/admin/users/{id}`).  |
| `created_at`           | `Timestamptz`             | Timestamp of user creation.                                                                  |
| `updated_at`           | `Timestamptz`             | Timestamp of last update.                                                                    |
| `last_sign_in_at`      | `Timestamptz` — nullable  | Timestamp of most recent successful sign-in (shown in admin dashboard).                     |
| `confirmed_at`         | `Timestamptz` — nullable  | Email confirmation timestamp (`null` until email verified).                                 |

**Application Mapping** (from `src/components/AdminDashboard.tsx` — `AdminUser` interface):

| App Property      | DB Source                                  |
|-------------------|--------------------------------------------|
| `id`              | `auth.users.id`                            |
| `email`           | `auth.users.email` or `profiles.email`     |
| `full_name`       | `profiles.full_name` or `auth.users.user_metadata.full_name` |
## Database Functions

| Function Name          | Language  | Security          | Description                                                              |
|------------------------|-----------|-------------------|--------------------------------------------------------------------------|
| `set_updated_at()`     | PL/pgSQL  | Definer-owned     | Trigger function for `profiles`: sets `new.updated_at = now()` before each row update. |
| `handle_new_user()`    | PL/pgSQL  | `SECURITY DEFINER` | Trigger function: auto-inserts a `profiles` row after a new `auth.users` row, using `ON CONFLICT ... DO UPDATE` for idempotency. |
| `is_admin()`           | SQL       | `SECURITY DEFINER` | Returns `true` if the authenticated user (`auth.uid()`) has `role = 'admin'` in `profiles`. Used in all RLS policies. |

## Entity-Relationship Diagram

```
┌──────────────────────────────────┐  1    1  ┌──────────────────────────────────┐
│           auth.users             │◄─────────┤       public.profiles            │
│   (Supabase-managed identity)    │          │   (application profile)          │
├──────────────────────────────────┤          ├──────────────────────────────────┤
│  id UUID   ◄── PK ───────────────┤          │  id UUID  ◄── PK, FK ────────┐   │
│  email TEXT                     │  │          │  email TEXT               │   │   │
│  raw_user_meta_data JSONB        │  │          │  full_name TEXT            │   │   │
│  app_metadata JSONB              │  │          │  role TEXT ('user'|'admin') │   │   │
│  created_at TIMESTAMPTZ           │  │          │  created_at TIMESTAMPTZ    │   │   │
│  updated_at TIMESTAMPTZ           │  │          │  updated_at TIMESTAMPTZ    │   │   │
│  last_sign_in_at TIMESTAMPTZ     │  │          │  (trigger: set_updated_at)  │   │   │
│  confirmed_at TIMESTAMPTZ         │  │          │                              │   │   │
└──────────────────────────────────┘  │          │  ON DELETE: CASCADE          │   │   │
                                      │          └──────────────────────────────┘   │
                                      │                                     ON DELETE
                                      │                                     SET NULL
                                      ▼                                     CASCADE  │
┌──────────────────────────────────┐          ┌───────────────────────────────┘   │
│       public.user_queries        │  N    │                                     │
│     (analytics / audit log)      │◄────────                                     │
├──────────────────────────────────┤          └──────────────────────────────────┘
│  id UUID   ◄── PK ───────────────┤
│  user_id UUID ◄── FK ────────────┤
│  query TEXT (NOT NULL)           │
│  source TEXT ('primary'|'brave') │
│  status TEXT ('success'|'error'|'cancelled') │
│  session_id TEXT                 │
│  created_at TIMESTAMPTZ now()    │
└──────────────────────────────────┘
```

## Security Model

| Layer             | Mechanism                                                              |
|-------------------|------------------------------------------------------------------------|
| **Authentication**| Supabase Auth (`auth.users`) — email/password sign-in/sign-up.         |
| **Authorization** | `profiles.role` column (`'user'` / `'admin'`), checked via `is_admin()`. |
| **RLS — profiles**| Enabled. Policies: users access own row; admins access all rows.       |
| **RLS — user_queries** | Enabled. INSERT restricted to own queries; SELECT restricted to admins. |
| **Server-side Admin** | API routes (`api/admin/*.ts`) use `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for admin operations. |

## Environment Variables

| Variable                  | Scope        | Used By                | Purpose                                        |
|---------------------------|--------------|------------------------|------------------------------------------------|
| `VITE_SUPABASE_URL`       | Frontend     | `src/lib/supabase.ts`  | Supabase project URL.                          |
| `VITE_SUPABASE_ANON_KEY`  | Frontend     | `src/lib/supabase.ts`  | Anonymous API key (RLS-constrained).             |
| `SUPABASE_URL`            | Server-side  | `api/admin/*.ts`       | Same as above; fallback if `VITE_` unset.       |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side | `api/admin/*.ts`    | Service-role key (bypasses RLS for admin ops). |

---

*This data dictionary is derived from the source schema in `supabase/schema.sql` and cross-referenced with application code in `src/` and `api/`.*
| `role`            | `profiles.role`                            |
| `created_at`      | `profiles.created_at` or `auth.users.created_at` |
| `last_sign_in_at` | `auth.users.last_sign_in_at`               |
| `confirmed_at`    | `auth.users.confirmed_at`                  |
| `id`          | `id`                     | `string`                             |
| `userId`      | `user_id`                | `string \| null`                     |
| `email`       | `profiles.email` (joined)| `string \| null`                     |
| `fullName`    | `profiles.full_name` (joined) | `string \| null`                |
| `query`       | `query`                  | `string`                             |
| `source`      | `source`                 | `'primary' \| 'brave'`               |
| `status`      | `status`                 | `'success' \| 'error' \| 'cancelled'` |
| `sessionId`   | `session_id`             | `string \| null`                     |
| `createdAt`   | `created_at`             | `string`                             |

| App Property  | DB Column    | TS Type             |
|---------------|--------------|---------------------|
| `id`          | `id`         | `string`            |
| `email`       | `email`      | `string \| null`    |
| `full_name`   | `full_name`  | `string \| null`    |
| `role`        | `role`       | `'user' \| 'admin'` |
| `created_at`  | `created_at` | `string`            |
| `updated_at`  | `updated_at` | `string`            |


```
auth.users (id)
    └──< public.profiles (id)         [1:1, FK on delete CASCADE]
    └──< public.user_queries (user_id) [1:0..N, FK on delete SET NULL]
```