import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { displayNameSchema } from '@/lib/validation/schemas';
import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(6, 'Minimum 6 caractères')
  .max(200);

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
  const nameParsed = displayNameSchema.safeParse(body.displayName);
  if (!nameParsed.success) {
    return NextResponse.json({ error: nameParsed.error.issues[0].message }, { status: 400 });
  }

  // Password is optional when activating (admins may not need one — they were
  // created via dashboard). But for self-registered trial users it's required.
  let newPassword = null;
  if (body.password !== undefined && body.password !== '') {
    const pwParsed = passwordSchema.safeParse(body.password);
    if (!pwParsed.success) {
      return NextResponse.json({ error: pwParsed.error.issues[0].message }, { status: 400 });
    }
    newPassword = pwParsed.data;
  }

  const admin = createSupabaseAdminClient();

  if (newPassword) {
    const { error: pwErr } = await admin.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });
    if (pwErr) {
      return NextResponse.json({ error: pwErr.message }, { status: 400 });
    }
  }

  const { data: existing } = await admin
    .from('allowed_users')
    .select('id, status, access_level')
    .eq('id', user.id)
    .maybeSingle();

  if (!existing) {
    await admin.from('allowed_users').insert({
      id: user.id,
      email: user.email,
      status: 'active',
      activated_at: new Date().toISOString(),
      display_name: nameParsed.data,
      access_level: 'trial',
    });
  } else {
    await admin
      .from('allowed_users')
      .update({
        display_name: nameParsed.data,
        status: existing.status === 'revoked' ? 'revoked' : 'active',
        activated_at: existing.status === 'revoked' ? null : new Date().toISOString(),
      })
      .eq('id', user.id);
  }

  return NextResponse.json({ ok: true });
}
