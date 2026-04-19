'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export default function ResetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Confirm there's an active session (the callback route should have set it).
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setError('Lien expiré ou invalide. Demandez un nouveau lien de réinitialisation.');
      }
      setReady(true);
    });
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Minimum 6 caractères');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: updErr } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updErr) {
      setError(updErr.message);
      return;
    }
    setSuccess(true);
    setTimeout(() => {
      router.replace('/dashboard');
      router.refresh();
    }, 1200);
  }

  if (!ready) {
    return <p className="text-sm text-gray-400 text-center">Chargement…</p>;
  }

  if (success) {
    return (
      <p className="text-center text-green-400 text-sm">
        Mot de passe mis à jour. Redirection…
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm font-medium text-gray-300">
        Nouveau mot de passe
        <input
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full px-4 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] focus:border-[#FFCC00] focus:outline-none transition"
        />
      </label>
      <label className="block text-sm font-medium text-gray-300">
        Confirmer le mot de passe
        <input
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1 w-full px-4 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] focus:border-[#FFCC00] focus:outline-none transition"
        />
      </label>
      {error ? <p className="text-red-400 text-sm">{error}</p> : null}
      <button
        type="submit"
        disabled={loading || !password || !confirm}
        className="w-full py-3 rounded-xl bg-[#FFCC00] text-black font-bold disabled:opacity-60 hover:scale-[1.01] transition"
      >
        {loading ? 'Mise à jour…' : 'Mettre à jour'}
      </button>
      <Link
        href="/login"
        className="block text-center text-sm text-gray-400 hover:text-[#FFCC00] transition"
      >
        ← Retour à la connexion
      </Link>
    </form>
  );
}
