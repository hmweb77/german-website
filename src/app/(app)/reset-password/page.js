import ResetPasswordForm from './ResetPasswordForm';

export const metadata = {
  title: 'Nouveau mot de passe — DeutschMaroc',
};

export const dynamic = 'force-dynamic';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#0d1117] text-[#e6edf3]">
      <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-3xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-[#FFCC00] font-bold text-xl">
            DeutschMaroc
          </div>
          <h1 className="text-2xl font-bold">Nouveau mot de passe</h1>
          <p className="text-sm text-gray-400">
            Choisissez un nouveau mot de passe pour votre compte.
          </p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
