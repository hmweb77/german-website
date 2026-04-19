import AdminShell from '@/components/app/AdminShell';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import NotificationsManager from './NotificationsManager';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Annonces — Admin' };

export default async function AdminNotificationsPage() {
  const admin = createSupabaseAdminClient();
  const { data: notifications } = await admin
    .from('notifications')
    .select('id, title, body, created_at, created_by')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <AdminShell active="notifications">
      <NotificationsManager initialItems={notifications || []} />
    </AdminShell>
  );
}
