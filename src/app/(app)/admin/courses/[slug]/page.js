import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import AdminShell from '@/components/app/AdminShell';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import LessonsManager from './LessonsManager';
import CourseEditor from './CourseEditor';

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

        <CourseEditor course={course} lessons={lessons || []} />

        <LessonsManager courseId={course.id} initialLessons={lessons || []} />
      </div>
    </AdminShell>
  );
}
