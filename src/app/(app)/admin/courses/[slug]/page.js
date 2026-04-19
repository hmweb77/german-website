import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import AdminShell from '@/components/app/AdminShell';
import LevelBadge from '@/components/app/LevelBadge';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import LessonsManager from './LessonsManager';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return { title: `${slug} — Admin` };
}

export default async function AdminCourseLessonsPage({ params }) {
  const { slug } = await params;
  const admin = createSupabaseAdminClient();

  const { data: course } = await admin
    .from('courses')
    .select('id, slug, title, description, level, is_published')
    .eq('slug', slug)
    .maybeSingle();
  if (!course) notFound();

  const { data: lessons } = await admin
    .from('lessons')
    .select('id, title, description, cloudflare_video_id, duration_seconds, thumbnail_url, order_index, is_published')
    .eq('course_id', course.id)
    .order('order_index', { ascending: true });

  return (
    <AdminShell active="courses">
      <div className="space-y-6">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#FFCC00] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Tous les cours
        </Link>

        <header className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5">
          <div className="flex items-center gap-3 flex-wrap">
            <LevelBadge level={course.level} />
            <span className="text-xs text-gray-500 font-mono">/{course.slug}</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold">{course.title}</h1>
          {course.description ? (
            <p className="text-gray-400 mt-1">{course.description}</p>
          ) : null}
        </header>

        <LessonsManager courseId={course.id} initialLessons={lessons || []} />
      </div>
    </AdminShell>
  );
}
