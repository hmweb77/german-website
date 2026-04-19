import AdminShell from '@/components/app/AdminShell';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import CoursesManager from './CoursesManager';

export const metadata = { title: 'Cours — Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminCoursesPage() {
  const admin = createSupabaseAdminClient();
  const { data: courses } = await admin
    .from('courses')
    .select('id, slug, title, description, level, order_index, is_published')
    .order('level', { ascending: true })
    .order('order_index', { ascending: true });

  const { data: counts } = await admin
    .from('lessons')
    .select('course_id');

  const countByCourse = new Map();
  for (const row of counts || []) {
    countByCourse.set(row.course_id, (countByCourse.get(row.course_id) || 0) + 1);
  }

  const rows = (courses || []).map((c) => ({
    ...c,
    lesson_count: countByCourse.get(c.id) || 0,
  }));

  return (
    <AdminShell active="courses">
      <CoursesManager courses={rows} />
    </AdminShell>
  );
}
