import { redirect } from 'next/navigation';
import { Download } from 'lucide-react';
import AppShell from '@/components/app/AppShell';
import LevelCard from '@/components/app/LevelCard';
import ContinueWatchingCard from '@/components/app/ContinueWatchingCard';
import { getSessionAndProfile, isActiveUser } from '@/lib/supabase/session';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { LEVELS } from '@/lib/format';
import { getTrialUnlockedLesson, isTrialProfile } from '@/lib/access';

export const metadata = { title: 'Tableau de bord — DeutschMaroc' };
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { user, profile } = await getSessionAndProfile();
  if (!user) redirect('/login');
  if (!isActiveUser(profile)) redirect('/access-denied');
  if (!profile.display_name) redirect('/activate');

  const admin = createSupabaseAdminClient();

  const [{ data: courses }, { data: lessons }, { data: progressRows }, { data: certs }] =
    await Promise.all([
      admin
        .from('courses')
        .select('id, slug, title, description, level, is_published')
        .order('order_index', { ascending: true }),
      admin.from('lessons').select('id, course_id, duration_seconds, is_published, order_index, title, thumbnail_url'),
      admin
        .from('watch_progress')
        .select('lesson_id, watched_seconds, completed, last_watched_at')
        .eq('user_id', user.id),
      admin.from('certificates').select('level, issued_at').eq('user_id', user.id),
    ]);

  const publishedLessonsByCourse = new Map();
  for (const l of lessons || []) {
    if (!l.is_published) continue;
    if (!publishedLessonsByCourse.has(l.course_id)) {
      publishedLessonsByCourse.set(l.course_id, []);
    }
    publishedLessonsByCourse.get(l.course_id).push(l);
  }

  const progressByLesson = new Map(
    (progressRows || []).map((p) => [p.lesson_id, p])
  );

  // Compute per-level rollups.
  const coursesByLevel = new Map();
  for (const c of courses || []) {
    if (!coursesByLevel.has(c.level)) coursesByLevel.set(c.level, []);
    coursesByLevel.get(c.level).push(c);
  }

  const trialUnlock = profile.is_admin ? null : await getTrialUnlockedLesson();
  const isTrial = isTrialProfile(profile) && !profile.is_admin;

  const levelSummaries = LEVELS.map((level) => {
    const levelCourses = (coursesByLevel.get(level) || []).filter((c) => c.is_published);
    const courseForCard = levelCourses[0] || null;
    let total = 0;
    let done = 0;
    for (const c of levelCourses) {
      const ls = publishedLessonsByCourse.get(c.id) || [];
      total += ls.length;
      for (const l of ls) {
        if (progressByLesson.get(l.id)?.completed) done += 1;
      }
    }
    const completion = total > 0 ? (done / total) * 100 : 0;
    const trialLocked =
      isTrial && (!courseForCard || !trialUnlock || courseForCard.id !== trialUnlock.courseId);
    return { level, course: courseForCard, lessonCount: total, completion, trialLocked };
  });

  // Continue watching — most recent incomplete lesson.
  let continueItem = null;
  const sorted = (progressRows || [])
    .filter((p) => !p.completed)
    .sort((a, b) => new Date(b.last_watched_at) - new Date(a.last_watched_at));
  for (const p of sorted) {
    const lesson = (lessons || []).find((l) => l.id === p.lesson_id && l.is_published);
    if (!lesson) continue;
    const course = (courses || []).find((c) => c.id === lesson.course_id && c.is_published);
    if (!course) continue;
    continueItem = { lesson, course, progress: p };
    break;
  }

  return (
    <AppShell activeSection="dashboard">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8">
        <header>
          <p className="text-sm text-gray-400">
            Bienvenue, <span className="text-[#FFCC00] font-semibold">{profile.display_name}</span>
          </p>
          <h1 className="mt-1 text-3xl md:text-4xl font-bold">
            Votre parcours
          </h1>
        </header>

        {isTrial ? (
          <div className="rounded-2xl border border-[#FFCC00]/30 bg-[#FFCC00]/5 px-5 py-4 text-sm text-[#FFCC00]/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-[#FFCC00]">Essai gratuit actif</div>
              <div className="text-xs text-[#FFCC00]/80 mt-0.5">
                Vous avez accès à la première leçon du premier cours. Débloquez tout le
                programme pour accéder à l'ensemble des niveaux.
              </div>
            </div>
            <a
              href="mailto:support@deutschmaroc.com?subject=Débloquer%20tous%20les%20cours"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFCC00] text-black font-semibold text-sm hover:scale-[1.02] transition whitespace-nowrap"
            >
              Débloquer tout
            </a>
          </div>
        ) : null}

        {continueItem ? <ContinueWatchingCard item={continueItem} /> : null}

        <section>
          <h2 className="text-lg font-semibold mb-4">Niveaux</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {levelSummaries.map((s) => (
              <LevelCard key={s.level} {...s} />
            ))}
          </div>
        </section>

        {certs && certs.length > 0 ? (
          <section>
            <h2 className="text-lg font-semibold mb-4">Mes certificats</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {certs.map((c) => (
                <a
                  key={c.level}
                  href={`/api/certificates/${encodeURIComponent(c.level)}`}
                  className="flex items-center justify-between gap-3 p-4 rounded-xl border border-[#30363d] bg-[#161b22] hover:border-[#FFCC00]/60 transition"
                >
                  <div>
                    <div className="text-xs text-gray-400 font-mono">Niveau</div>
                    <div className="text-lg font-semibold">{c.level}</div>
                  </div>
                  <Download className="w-5 h-5 text-[#FFCC00]" />
                </a>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
