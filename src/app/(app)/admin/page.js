import AdminShell from '@/components/app/AdminShell';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const metadata = { title: 'Administration — DeutschMaroc' };
export const dynamic = 'force-dynamic';

async function getStats() {
  const admin = createSupabaseAdminClient();
  const [users, courses, lessons] = await Promise.all([
    admin.from('allowed_users').select('status', { count: 'exact' }),
    admin.from('courses').select('id', { count: 'exact', head: true }),
    admin.from('lessons').select('id', { count: 'exact', head: true }),
  ]);

  const counts = { active: 0, pending: 0, revoked: 0 };
  for (const row of users.data || []) {
    if (row.status in counts) counts[row.status] += 1;
  }

  const { data: recentLogins } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 5,
  });
  const { data: recentLessons } = await admin
    .from('lessons')
    .select('id, title, created_at, course_id, courses(title, level)')
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    userCounts: counts,
    courseCount: courses.count || 0,
    lessonCount: lessons.count || 0,
    recentLogins: (recentLogins?.users || [])
      .filter((u) => u.last_sign_in_at)
      .sort((a, b) => new Date(b.last_sign_in_at) - new Date(a.last_sign_in_at))
      .slice(0, 5),
    recentLessons: recentLessons || [],
  };
}

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5">
      <div className="text-xs uppercase tracking-wide text-gray-500 font-mono">
        {label}
      </div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
      {hint ? <div className="text-xs text-gray-500 mt-1">{hint}</div> : null}
    </div>
  );
}

export default async function AdminOverviewPage() {
  const s = await getStats();

  return (
    <AdminShell active="overview">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Vue d'ensemble</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Utilisateurs actifs" value={s.userCounts.active} />
          <StatCard label="En attente" value={s.userCounts.pending} />
          <StatCard label="Révoqués" value={s.userCounts.revoked} />
          <StatCard label="Cours" value={s.courseCount} hint={`${s.lessonCount} leçons`} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">
              Connexions récentes
            </h2>
            {s.recentLogins.length === 0 ? (
              <p className="text-sm text-gray-500">Aucune connexion récente.</p>
            ) : (
              <ul className="divide-y divide-[#21262d]">
                {s.recentLogins.map((u) => (
                  <li key={u.id} className="py-2 flex items-center justify-between text-sm">
                    <span className="truncate">{u.email}</span>
                    <span className="text-xs text-gray-500 font-mono">
                      {new Date(u.last_sign_in_at).toLocaleString('fr-FR')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">
              Dernières leçons ajoutées
            </h2>
            {s.recentLessons.length === 0 ? (
              <p className="text-sm text-gray-500">Aucune leçon.</p>
            ) : (
              <ul className="divide-y divide-[#21262d]">
                {s.recentLessons.map((l) => (
                  <li key={l.id} className="py-2 flex items-center justify-between text-sm gap-3">
                    <span className="truncate">
                      <span className="text-xs text-gray-500 font-mono mr-2">
                        {l.courses?.level}
                      </span>
                      {l.title}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      {new Date(l.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
