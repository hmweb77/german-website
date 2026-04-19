import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/adminGuard';
import { lessonReorderSchema } from '@/lib/validation/schemas';

export async function POST(request) {
  const { error, admin } = await requireAdmin();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const parsed = lessonReorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  // Run updates sequentially to keep ordering deterministic and avoid collisions.
  for (const item of parsed.data.items) {
    const { error: updErr } = await admin
      .from('lessons')
      .update({ order_index: item.order_index })
      .eq('id', item.id);
    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}
