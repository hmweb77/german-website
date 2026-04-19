import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import AppShell from '@/components/app/AppShell';
import LevelBadge from '@/components/app/LevelBadge';
import VideoPlayer from '@/components/app/VideoPlayer';
import NotesPanel from '@/components/app/NotesPanel';
import { getSessionAndProfile, isActiveUser } from '@/lib/supabase/session';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { signPlaybackToken } from '@/lib/cloudflare/signedUrl';
import { formatDuration } from '@/lib/format';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { lessonId } = await params;
  return { title: `Leçon ${lessonId.slice(0, 6)} — DeutschMaroc` };
}

export default async function LessonPage({ params }) {
  const { slug, lessonId } = await params;
  const { user, profile } = await getSessionAndProfile();
  if (!user) redirect('/login');
  if (!isActiveUser(profile)) redirect('/access-denied');
  if (!profile.display_name) redirect('/activate');

  const admin = createSupabaseAdminClient();

  const { data: course } = await admin
    .from('courses')
    .select('id, slug, title, level, is_published')
    .eq('slug', slug)
    .maybeSingle();
  if (!course || (!course.is_published && !profile.is_admin)) notFound();

  const { data: lessons } = await admin
    .from('lessons')
    .select('id, title, description, cloudflare_video_id, duration_seconds, thumbnail_url, order_index, is_published')
    .eq('course_id', course.id)
    .order('order_index', { ascending: true });

  const visible = (lessons || []).filter((l) => l.is_published || profile.is_admin);
  const idx = visible.findIndex((l) => l.id === lessonId);
  if (idx < 0) notFound();
  const lesson = visible[idx];
  const prev = idx > 0 ? visible[idx - 1] : null;
  const next = idx < visible.length - 1 ? visible[idx + 1] : null;

  const [{ data: progress }, { data: note }, { data: progressRows }] = await Promise.all([
    admin
      .from('watch_progress')
      .select('watched_seconds, completed')
      .eq('user_id', user.id)
      .eq('lesson_id', lesson.id)
      .maybeSingle(),
    admin
      .from('lesson_notes')
      .select('content')
      .eq('user_id', user.id)
      .eq('lesson_id', lesson.id)
      .maybeSingle(),
    admin
      .from('watch_progress')
      .select('lesson_id, completed')
      .eq('user_id', user.id)
      .in('lesson_id', visible.map((l) => l.id)),
  ]);

  const doneSet = new Set(
    (progressRows || []).filter((p) => p.completed).map((p) => p.lesson_id)
  );

  let signedToken = null;
  if (lesson.cloudflare_video_id) {
    try {
      signedToken = await signPlaybackToken({
        videoUid: lesson.cloudflare_video_id,
        expSeconds: 3 * 3600,
      });
    } catch (err) {
      console.error('signPlaybackToken failed:', err);
    }
  }

  return (
    <AppShell activeSection="dashboard">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <Link
          href={`/courses/${course.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#FFCC00] transition mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {course.title}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-5">
            {signedToken ? (
              <VideoPlayer
                lessonId={lesson.id}
                signedToken={signedToken}
                initialWatchedSeconds={progress?.watched_seconds || 0}
                initialCompleted={!!progress?.completed}
                durationSeconds={lesson.duration_seconds || 0}
              />
            ) : (
              <div className="aspect-video w-full rounded-2xl border border-[#30363d] bg-[#161b22] flex items-center justify-center text-gray-500">
                Vidéo en cours de traitement…
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <LevelBadge level={course.level} />
              <span className="text-xs text-gray-500 font-mono">
                {formatDuration(lesson.duration_seconds)}
              </span>
            </div>

            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            {lesson.description ? (
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {lesson.description}
              </div>
            ) : null}

            <NotesPanel lessonId={lesson.id} initialContent={note?.content || ''} />

            <div className="flex items-center justify-between pt-2">
              {prev ? (
                <Link
                  href={`/courses/${course.slug}/lessons/${prev.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#30363d] hover:border-[#FFCC00]/60 transition text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Précédente
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  href={`/courses/${course.slug}/lessons/${next.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFCC00] text-black font-semibold text-sm hover:scale-[1.02] transition"
                >
                  Leçon suivante
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : null}
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-20 rounded-2xl border border-[#30363d] bg-[#161b22] p-4">
              <div className="text-xs uppercase tracking-wide text-gray-500 font-mono mb-2 px-1">
                Leçons
              </div>
              <ol className="space-y-1 max-h-[70vh] overflow-auto pr-1">
                {visible.map((l, i) => {
                  const done = doneSet.has(l.id);
                  const active = l.id === lesson.id;
                  return (
                    <li key={l.id}>
                      <Link
                        href={`/courses/${course.slug}/lessons/${l.id}`}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition ${
                          active
                            ? 'bg-[#1b222c] text-[#FFCC00]'
                            : 'text-gray-300 hover:bg-[#1b222c]'
                        }`}
                      >
                        <span className="w-5 text-xs text-gray-500 font-mono">
                          {i + 1}
                        </span>
                        <span className="flex-1 truncate">{l.title}</span>
                        {done ? <span className="text-green-400 text-xs">✓</span> : null}
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
