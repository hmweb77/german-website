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

  // Insert a fresh active row keyed to the session user.id. Handles the
  // migration 0002 fallback. Returns { error } on hard failure.
  async function insertActiveRow() {
    const baseRow = {
      id: user.id,
      email: user.email,
      status: 'active',
      activated_at: new Date().toISOString(),
      display_name: nameParsed.data,
    };
    const { error: insErr } = await admin
      .from('allowed_users')
      .insert({ ...baseRow, access_level: 'trial' });
    if (insErr) {
      const retry = await admin.from('allowed_users').insert(baseRow);
      if (retry.error) return { error: retry.error };
    }
    return { error: null };
  }

  const { data: existing } = await admin
    .from('allowed_users')
    .select('id, status, access_level')
    .eq('id', user.id)
    .maybeSingle();

  if (!existing) {
    const { error } = await insertActiveRow();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    // .select() lets us detect silent 0-row updates. Supabase's .update() does
    // NOT error when the filter matches nothing — without this we'd return 200
    // while leaving the row stuck in 'pending'.
    const { data: updated, error: updErr } = await admin
      .from('allowed_users')
      .update({
        display_name: nameParsed.data,
        status: existing.status === 'revoked' ? 'revoked' : 'active',
        activated_at: existing.status === 'revoked' ? null : new Date().toISOString(),
      })
      .eq('id', user.id)
      .select('id');
    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    if (!updated || updated.length === 0) {
      // Session user.id didn't match any row. Reconcile: if an orphan row
      // exists for this email under a different id, drop it, then insert a
      // fresh row keyed to the current session user.id.
      const { data: orphan } = await admin
        .from('allowed_users')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();
      if (orphan && orphan.id !== user.id) {
        const { error: delErr } = await admin
          .from('allowed_users')
          .delete()
          .eq('email', user.email);
        if (delErr) {
          console.error('[set-display-name reconcile] delete orphan', delErr);
          return NextResponse.json({ error: delErr.message }, { status: 500 });
        }
      }
      const { error: insErr } = await insertActiveRow();
      if (insErr) {
        console.error('[set-display-name reconcile] insert', insErr);
        return NextResponse.json({ error: insErr.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
