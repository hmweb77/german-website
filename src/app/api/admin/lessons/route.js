import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/adminGuard';
import { lessonSchema } from '@/lib/validation/schemas';

export async function POST(request) {
  const { error, admin } = await requireAdmin();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const parsed = lessonSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  let orderIndex = parsed.data.order_index;
  if (typeof orderIndex !== 'number') {
    const { data: last } = await admin
      .from('lessons')
      .select('order_index')
      .eq('course_id', parsed.data.course_id)
      .order('order_index', { ascending: false })
      .limit(1)
      .maybeSingle();
    orderIndex = (last?.order_index ?? -1) + 1;
  }

  const { data, error: insErr } = await admin
    .from('lessons')
    .insert({
      course_id: parsed.data.course_id,
      title: parsed.data.title,
      description: parsed.data.description || null,
      order_index: orderIndex,
      is_published: parsed.data.is_published ?? false,
    })
    .select()
    .single();
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 });

  return NextResponse.json({ ok: true, lesson: data });
}
