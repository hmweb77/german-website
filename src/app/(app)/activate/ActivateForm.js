'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ActivateForm({ defaultValue, email }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(defaultValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/set-display-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur');
      router.replace('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="text-xs text-gray-500">
        Connecté en tant que <span className="text-gray-300">{email}</span>
      </div>
      <label className="block text-sm font-medium text-gray-300">
        Nom d'affichage
        <input
          type="text"
          required
          minLength={2}
          maxLength={50}
          autoFocus
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="ex. Oussama H."
          className="mt-1 w-full px-4 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] focus:border-[#FFCC00] focus:outline-none transition"
        />
      </label>
      {error ? <p className="text-red-400 text-sm">{error}</p> : null}
      <button
        type="submit"
        disabled={loading || displayName.trim().length < 2}
        className="w-full py-3 rounded-xl bg-[#FFCC00] text-black font-bold disabled:opacity-60 hover:scale-[1.01] transition"
      >
        {loading ? 'Activation…' : 'Activer mon compte'}
      </button>
    </form>
  );
}
