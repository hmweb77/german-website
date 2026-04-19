import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { displayNameSchema } from '@/lib/validation/schemas';

export async function POST(request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 });
  }
  const parsed = displayNameSchema.safeParse(body.displayName);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  // Upsert: if the invite created only auth.users, make sure allowed_users row exists.
  const { data: existing } = await admin
    .from('allowed_users')
    .select('id, status')
    .eq('id', user.id)
    .maybeSingle();

  if (!existing) {
    await admin.from('allowed_users').insert({
      id: user.id,
      email: user.email,
      status: 'active',
      activated_at: new Date().toISOString(),
      display_name: parsed.data,
    });
  } else {
    await admin
      .from('allowed_users')
      .update({
        display_name: parsed.data,
        status: existing.status === 'revoked' ? 'revoked' : 'active',
        activated_at: existing.status === 'revoked' ? null : new Date().toISOString(),
      })
      .eq('id', user.id);
  }

  return NextResponse.json({ ok: true });
}
