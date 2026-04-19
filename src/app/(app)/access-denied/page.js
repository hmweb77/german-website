import Link from 'next/link';

export const metadata = {
  title: "Accès restreint — DeutschMaroc",
};

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#0d1117] text-[#e6edf3]">
      <div className="max-w-lg w-full bg-[#161b22] border border-[#30363d] rounded-3xl p-8 text-center space-y-5">
        <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#FFCC00]/10 text-[#FFCC00] text-3xl">
          🔒
        </div>
        <h1 className="text-2xl font-bold">Accès restreint</h1>
        <p className="text-gray-300 leading-relaxed">
          Votre compte n'est pas actif sur DeutschMaroc. Il est peut-être en
          attente d'activation, ou son accès a été révoqué.
        </p>
        <p className="text-sm text-gray-400">
          Si vous pensez qu'il s'agit d'une erreur, contactez-nous à{' '}
          <a
            href="mailto:support@deutschmaroc.com"
            className="text-[#FFCC00] underline underline-offset-2"
          >
            support@deutschmaroc.com
          </a>
          .
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold border border-[#30363d] bg-[#0d1117] hover:border-[#FFCC00] transition-all"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
