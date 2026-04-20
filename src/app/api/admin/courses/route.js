import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/adminGuard';
import { courseSchema } from '@/lib/validation/schemas';

export async function POST(request) {
  const { error, admin } = await requireAdmin();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const parsed = courseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { data, error: insErr } = await admin
    .from('courses')
    .insert({
      slug: parsed.data.slug,
      title: parsed.data.title,
      description: parsed.data.description || null,
      level: parsed.data.level,
      order_index: parsed.data.order_index ?? 0,
      // Default new courses to published for the same reason as new lessons —
      // admins can send is_published:false explicitly to create drafts.
      is_published: parsed.data.is_published ?? true,
    })
    .select()
    .single();
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 });

  return NextResponse.json({ ok: true, course: data });
}
