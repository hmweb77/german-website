'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Megaphone, Trash2 } from 'lucide-react';

function formatDate(s) {
  try {
    return new Date(s).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return s;
  }
}

export default function NotificationsManager({ initialItems }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [form, setForm] = useState({ title: '', body: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function broadcast(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur');
      setForm({ title: '', body: '' });
      setSuccess('Annonce publiée.');
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function remove(id) {
    if (!confirm('Supprimer cette annonce ?')) return;
    const res = await fetch(`/api/admin/notifications?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || 'Échec');
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Megaphone className="w-5 h-5 text-[#FFCC00]" />
        <h1 className="text-2xl font-bold">Annonces</h1>
      </div>

      <form
        onSubmit={broadcast}
        className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5 space-y-4"
      >
        <h2 className="text-sm font-semibold text-gray-300">Nouvelle annonce</h2>
        <label className="block text-sm">
          Titre
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-1 w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] focus:border-[#FFCC00] focus:outline-none"
          />
        </label>
        <label className="block text-sm">
          Message
          <textarea
            required
            rows={4}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            className="mt-1 w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] focus:border-[#FFCC00] focus:outline-none"
          />
        </label>
        {error ? <div className="text-sm text-red-400">{error}</div> : null}
        {success ? <div className="text-sm text-green-400">{success}</div> : null}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#FFCC00] text-black font-semibold text-sm disabled:opacity-60 hover:scale-[1.02] transition"
          >
            {loading ? 'Publication…' : 'Publier'}
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-[#30363d] bg-[#161b22]">
        <div className="px-5 py-4 border-b border-[#30363d] text-sm font-semibold text-gray-300">
          Historique
        </div>
        {initialItems.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-500">
            Aucune annonce publiée.
          </div>
        ) : (
          <ul className="divide-y divide-[#21262d]">
            {initialItems.map((n) => (
              <li key={n.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium">{n.title}</div>
                  <div className="text-sm text-gray-400 mt-0.5 whitespace-pre-wrap">
                    {n.body}
                  </div>
                  <div className="text-[11px] text-gray-600 mt-1 font-mono">
                    {formatDate(n.created_at)}
                  </div>
                </div>
                <button
                  onClick={() => remove(n.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/10 text-xs transition shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
