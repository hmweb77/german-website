import { Suspense } from 'react';
import LoginForm from './LoginForm';
import { getSessionAndProfile } from '@/lib/supabase/session';

export const metadata = {
  title: 'Connexion — DeutschMaroc',
};

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const { user, profile } = await getSessionAndProfile();
  const stuck =
    !!user && (!profile || profile.status !== 'active' || !profile.display_name);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#0d1117] text-[#e6edf3]">
      <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-3xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-[#FFCC00] font-bold text-xl">
            DeutschMaroc
          </div>
          <h1 className="text-2xl font-bold">Connectez-vous</h1>
          <p className="text-sm text-gray-400">
            Entrez votre e-mail et votre mot de passe.
          </p>
        </div>

        {stuck ? (
          <div className="rounded-xl border border-[#FFCC00]/30 bg-[#FFCC00]/5 px-4 py-3 text-sm space-y-2">
            <div className="text-[#FFCC00] font-semibold">
              Vous êtes connecté en tant que {user.email}
            </div>
            <p className="text-gray-300">
              Votre compte n'est pas encore activé ou a un problème d'accès.
              Vous pouvez essayer un autre compte.
            </p>
            <a
              href="/api/auth/signout?next=/login"
              className="inline-block mt-1 underline text-[#FFCC00] font-semibold"
            >
              Se déconnecter et essayer un autre compte
            </a>
          </div>
        ) : null}

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
