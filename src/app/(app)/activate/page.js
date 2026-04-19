import { redirect } from 'next/navigation';
import { getSessionAndProfile } from '@/lib/supabase/session';
import ActivateForm from './ActivateForm';

export const metadata = { title: 'Activer mon compte — DeutschMaroc' };

export default async function ActivatePage() {
  const { user, profile } = await getSessionAndProfile();
  if (!user) redirect('/login');

  // Already fully active with a name → straight to dashboard.
  if (profile?.status === 'active' && profile?.display_name) {
    redirect('/dashboard');
  }

  if (profile?.status === 'revoked') {
    redirect('/access-denied');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#0d1117] text-[#e6edf3]">
      <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-3xl p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Bienvenue sur DeutschMaroc 🇩🇪</h1>
          <p className="text-sm text-gray-400">
            Choisissez le nom qui s'affichera dans votre espace.
          </p>
        </div>
        <ActivateForm
          defaultValue={profile?.display_name || ''}
          email={user.email}
        />
      </div>
    </div>
  );
}
