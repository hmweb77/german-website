import AdminShell from '@/components/app/AdminShell';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import UsersManager from './UsersManager';

export const metadata = { title: 'Utilisateurs — Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminUsersPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const q = (sp.q || '').toString().trim();
  const status = (sp.status || '').toString().trim();

  const admin = createSupabaseAdminClient();
  let query = admin
    .from('allowed_users')
    .select('id, email, status, is_admin, display_name, invited_at, activated_at')
    .order('invited_at', { ascending: false })
    .limit(200);

  if (q) query = query.ilike('email', `%${q}%`);
  if (status && ['pending', 'active', 'revoked'].includes(status)) {
    query = query.eq('status', status);
  }

  const { data: users } = await query;

  return (
    <AdminShell active="users">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-2xl font-bold">Utilisateurs</h1>
          <form
            action=""
            method="GET"
            className="flex items-center gap-2 text-sm flex-wrap"
          >
            <input
              name="q"
              defaultValue={q}
              placeholder="Rechercher un e-mail…"
              className="px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] focus:border-[#FFCC00] focus:outline-none w-56"
            />
            <select
              name="status"
              defaultValue={status}
              className="px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] focus:border-[#FFCC00] focus:outline-none"
            >
              <option value="">Tous</option>
              <option value="active">Actif</option>
              <option value="pending">En attente</option>
              <option value="revoked">Révoqué</option>
            </select>
            <button className="px-3 py-2 rounded-lg border border-[#30363d] hover:border-[#FFCC00]/60 transition">
              Filtrer
            </button>
          </form>
        </div>

        <UsersManager users={users || []} />
      </div>
    </AdminShell>
  );
}
