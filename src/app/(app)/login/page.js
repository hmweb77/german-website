import { Suspense } from 'react';
import LoginForm from './LoginForm';

export const metadata = {
  title: 'Connexion — DeutschMaroc',
};

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#0d1117] text-[#e6edf3]">
      <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-3xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-[#FFCC00] font-bold text-xl">
            DeutschMaroc
          </div>
          <h1 className="text-2xl font-bold">Connectez-vous</h1>
          <p className="text-sm text-gray-400">
            Entrez votre e-mail pour recevoir un code à 6 chiffres.
          </p>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
