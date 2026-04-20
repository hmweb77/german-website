import { createSupabaseAdminClient } from '@/lib/supabase/admin';

/**
 * Returns the single lesson that trial users are allowed to watch:
 * the lowest-order-index published lesson inside the lowest-order-index
 * published course. Returns null if no published lesson exists yet.
 */
export async function getTrialUnlockedLesson() {
  const admin = createSupabaseAdminClient();

  const { data: course } = await admin
    .from('courses')
    .select('id, slug, level, order_index')
    .eq('is_published', true)
    .order('order_index', { ascending: true })
    .order('level', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!course) return null;

  const { data: lesson } = await admin
    .from('lessons')
    .select('id, course_id, order_index')
    .eq('course_id', course.id)
    .eq('is_published', true)
    .order('order_index', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!lesson) return null;

  return {
    lessonId: lesson.id,
    courseId: course.id,
    courseSlug: course.slug,
    courseLevel: course.level,
  };
}

export function isTrialProfile(profile) {
  return !!profile && profile.access_level === 'trial';
}

export function canAccessLesson(profile, lessonId, trialUnlock) {
  if (!profile) return false;
  if (profile.access_level === 'full') return true;
  if (!trialUnlock) return false;
  return trialUnlock.lessonId === lessonId;
}

export function canAccessCourse(profile, courseId, trialUnlock) {
  if (!profile) return false;
  if (profile.access_level === 'full') return true;
  if (!trialUnlock) return false;
  return trialUnlock.courseId === courseId;
}
