import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import AppShell from '@/components/app/AppShell';
import LevelBadge from '@/components/app/LevelBadge';
import LessonCard from '@/components/app/LessonCard';
import ProgressBar from '@/components/app/ProgressBar';
import VideoPrefetch from '@/components/app/VideoPrefetch';
import { getSessionAndProfile, isActiveUser } from '@/lib/supabase/session';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import {
  getTrialUnlockedLesson,
  canAccessLesson,
  isTrialProfile,
} from '@/lib/access';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return { title: `${slug} — DeutschMaroc` };
}

export default async function CoursePage({ params }) {
  const { slug } = await params;
  const { user, profile } = await getSessionAndProfile();
  if (!user) redirect('/login');
  if (!profile || profile.status === 'pending') redirect('/activate');
  if (!isActiveUser(profile)) redirect('/access-denied');
  if (!profile.display_name) redirect('/activate');

  const admin = createSupabaseAdminClient();
  const { data: course } = await admin
    .from('courses')
    .select('id, slug, title, description, level, is_published')
    .eq('slug', slug)
    .maybeSingle();

  if (!course || (!course.is_published && !profile.is_admin)) notFound();

  const { data: lessons } = await admin
    .from('lessons')
    .select('id, title, description, thumbnail_url, duration_seconds, order_index, is_published, cloudflare_video_id')
    .eq('course_id', course.id)
    .order('order_index', { ascending: true });

  const visibleLessons = (lessons || []).filter((l) => l.is_published || profile.is_admin);

  const { data: progressRows } = await admin
    .from('watch_progress')
    .select('lesson_id, watched_seconds, completed, last_watched_at')
    .eq('user_id', user.id)
    .in(
      'lesson_id',
      visibleLessons.map((l) => l.id)
    );

  const progressByLesson = new Map(
    (progressRows || []).map((p) => [p.lesson_id, p])
  );

  const completed = (progressRows || []).filter((p) => p.completed).length;
  const completion =
    visibleLessons.length > 0 ? (completed / visibleLessons.length) * 100 : 0;

  const trialUnlock = profile.is_admin ? null : await getTrialUnlockedLesson();
  const isTrial = isTrialProfile(profile) && !profile.is_admin;

  // Prefetch the first lesson the student can actually play in this course.
  // For full-access users that's the first published lesson; for trial users
  // it's only the trial-unlocked lesson (if it belongs to this course).
  const firstAccessible = visibleLessons.find((l) =>
    profile.is_admin || canAccessLesson(profile, l.id, trialUnlock)
  );
  const prefetchLessons = firstAccessible?.cloudflare_video_id
    ? [{ id: firstAccessible.id, cloudflare_video_id: firstAccessible.cloudflare_video_id }]
    : [];

  return (
    <AppShell activeSection="dashboard">
      <VideoPrefetch lessons={prefetchLessons} />
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#FFCC00] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Tableau de bord
        </Link>

        <header className="rounded-3xl border border-[#30363d] bg-[#161b22] p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <LevelBadge level={course.level} />
            {!course.is_published ? (
              <span className="text-xs px-2 py-0.5 rounded-full border border-[#FFCC00]/40 text-[#FFCC00]">
                Non publié (aperçu admin)
              </span>
            ) : null}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">{course.title}</h1>
          {course.description ? (
            <p className="text-gray-300 leading-relaxed">{course.description}</p>
          ) : null}
          <div>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-gray-400">
                {completed} / {visibleLessons.length} leçons terminées
              </span>
              <span className="font-mono text-gray-400">
                {Math.round(completion)}%
              </span>
            </div>
            <ProgressBar value={completion} />
          </div>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Leçons</h2>
          {visibleLessons.length === 0 ? (
            <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-8 text-center text-gray-500">
              Aucune leçon publiée pour le moment.
            </div>
          ) : (
            <ul className="space-y-3">
              {isTrial ? (
                <li className="rounded-xl border border-[#FFCC00]/30 bg-[#FFCC00]/5 px-4 py-3 text-sm text-[#FFCC00]/90 flex items-center justify-between gap-3">
                  <span>
                    Essai gratuit : une seule leçon est accessible. Les autres sont
                    verrouillées.
                  </span>
                  <a
                    href="mailto:support@deutschmaroc.com?subject=Débloquer%20tous%20les%20cours"
                    className="underline font-semibold whitespace-nowrap"
                  >
                    Débloquer
                  </a>
                </li>
              ) : null}
              {visibleLessons.map((l) => (
                <li key={l.id}>
                  <LessonCard
                    lesson={l}
                    courseSlug={course.slug}
                    progress={progressByLesson.get(l.id)}
                    locked={
                      !profile.is_admin &&
                      !canAccessLesson(profile, l.id, trialUnlock)
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
