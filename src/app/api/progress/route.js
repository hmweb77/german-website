import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { progressSchema } from '@/lib/validation/schemas';

export async function POST(request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 });
  }
  const parsed = progressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  const { lesson_id, watched_seconds, completed } = parsed.data;

  // Fetch existing so we never regress watched_seconds or un-complete a lesson.
  const { data: existing } = await supabase
    .from('watch_progress')
    .select('watched_seconds, completed')
    .eq('user_id', user.id)
    .eq('lesson_id', lesson_id)
    .maybeSingle();

  const next = {
    user_id: user.id,
    lesson_id,
    watched_seconds: Math.max(existing?.watched_seconds || 0, watched_seconds),
    completed: !!(existing?.completed || completed),
    last_watched_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('watch_progress')
    .upsert(next, { onConflict: 'user_id,lesson_id' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  return NextResponse.json({ ok: true });
}
