import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { generateCertificatePdf } from '@/lib/certificates/generate';

export const runtime = 'nodejs';

const VALID_LEVELS = ['A1.1', 'A1.2', 'A2.1', 'A2.2'];

export async function GET(_request, { params }) {
  const { level } = await params;
  if (!VALID_LEVELS.includes(level)) {
    return NextResponse.json({ error: 'Niveau invalide' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: cert } = await supabase
    .from('certificates')
    .select('id, level, issued_at')
    .eq('user_id', user.id)
    .eq('level', level)
    .maybeSingle();
  if (!cert) {
    return NextResponse.json({ error: 'Certificat non disponible' }, { status: 404 });
  }

  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin
    .from('allowed_users')
    .select('display_name, email')
    .eq('id', user.id)
    .maybeSingle();

  const displayName = profile?.display_name || profile?.email || 'Étudiant(e)';

  const pdf = await generateCertificatePdf({
    displayName,
    level: cert.level,
    issuedAt: cert.issued_at,
  });

  return new Response(pdf, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="certificat-${level}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
