# Supabase setup — DeutschMaroc

## 1. Create a project

1. Create a new project at https://supabase.com/dashboard.
2. Copy these into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` → Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Project API keys → `anon public`
   - `SUPABASE_SERVICE_ROLE_KEY` → Project API keys → `service_role` (SERVER ONLY)

## 2. Apply the schema

Option A — SQL editor (quickest):
1. Open the SQL editor in the Supabase dashboard.
2. Paste the full contents of `migrations/0001_init.sql` and run.

Option B — Supabase CLI:
```bash
supabase db push
```

## 3. Seed the first admin

The platform is invitation-only, so there's a chicken-and-egg problem for the
very first admin. The simplest bootstrap:

1. In the Supabase dashboard → Authentication → Users, click **"Invite user"**
   and invite your own admin email.
2. Accept the invite in your inbox to create the `auth.users` row.
3. In the SQL editor, insert/upgrade your profile:

```sql
insert into public.allowed_users (id, email, status, is_admin, activated_at)
select id, email, 'active', true, now()
from auth.users
where email = 'you@example.com'
on conflict (id) do update
set status = 'active', is_admin = true, activated_at = coalesce(allowed_users.activated_at, now());
```

Every subsequent user is invited through the admin UI at `/admin/users`.

## 4. Auth settings

In the dashboard → Authentication → Providers:
- **Email** provider is enabled (default).
- Since we send emails through Resend ourselves, you do **not** need to
  configure Supabase's built-in SMTP.

In Authentication → URL configuration:
- Site URL: `https://deutschmaroc.com` (or your `NEXT_PUBLIC_APP_URL`).
- Redirect URLs: add `https://deutschmaroc.com/activate` and
  `http://localhost:3000/activate`.

## 5. Rate limits

The free tier rate-limits `admin.generateLink` calls. For bulk invites at
launch, upgrade to Pro or throttle the bulk-invite endpoint to ≤1 invite/sec.
