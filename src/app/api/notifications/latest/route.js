import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ items: [], unread: 0 }, { status: 401 });
  }

  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, title, body, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  const list = notifications || [];
  if (list.length === 0) {
    return NextResponse.json({ items: [], unread: 0 });
  }

  const ids = list.map((n) => n.id);
  const { data: reads } = await supabase
    .from('notification_reads')
    .select('notification_id')
    .eq('user_id', user.id)
    .in('notification_id', ids);

  const readSet = new Set((reads || []).map((r) => r.notification_id));
  const items = list.map((n) => ({ ...n, read: readSet.has(n.id) }));
  const unread = items.filter((i) => !i.read).length;

  return NextResponse.json({ items, unread });
}
