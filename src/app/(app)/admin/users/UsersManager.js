'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Users, Ban, Send } from 'lucide-react';

function StatusPill({ status }) {
  const cls =
    status === 'active'
      ? 'bg-green-500/15 text-green-300 border-green-500/40'
      : status === 'pending'
      ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40'
      : 'bg-red-500/15 text-red-300 border-red-500/40';
  const label =
    status === 'active' ? 'Actif' : status === 'pending' ? 'En attente' : 'Révoqué';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs border ${cls}`}>
      {label}
    </span>
  );
}

export default function UsersManager({ users }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState('');
  const [bulk, setBulk] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function invite(e) {
    e.preventDefault();
    setMsg('');
    setErr('');
    const res = await fetch('/api/admin/users/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    if (!res.ok) return setErr(json.error || 'Erreur');
    setMsg(`Invitation envoyée à ${email}.`);
    setEmail('');
    startTransition(() => router.refresh());
  }

  async function bulkInvite(e) {
    e.preventDefault();
    setMsg('');
    setErr('');
    const emails = bulk
      .split(/\s|,|;/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (emails.length === 0) return setErr('Aucun e-mail fourni');
    const res = await fetch('/api/admin/users/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails }),
    });
    const json = await res.json();
    if (!res.ok) return setErr(json.error || 'Erreur');
    const { invited = 0, skipped = 0, failed = 0 } = json;
    setMsg(`${invited} invités · ${skipped} déjà présents · ${failed} échecs`);
    setBulk('');
    startTransition(() => router.refresh());
  }

  async function revoke(id) {
    if (!confirm('Révoquer cet utilisateur ? Il sera déconnecté immédiatement.')) return;
    const res = await fetch('/api/admin/users/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error || 'Échec');
      return;
    }
    startTransition(() => router.refresh());
  }

  async function reinvite(id) {
    const res = await fetch('/api/admin/users/reinvite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error || 'Échec');
      return;
    }
    setMsg('Invitation renvoyée.');
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <form
          onSubmit={invite}
          className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5 space-y-3"
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            <UserPlus className="w-4 h-4 text-[#FFCC00]" />
            Inviter un utilisateur
          </div>
          <div className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="etudiant@exemple.com"
              className="flex-1 px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] focus:border-[#FFCC00] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!email || isPending}
              className="px-4 py-2 rounded-lg bg-[#FFCC00] text-black font-semibold disabled:opacity-60 hover:scale-[1.02] transition"
            >
              Inviter
            </button>
          </div>
        </form>

        <form
          onSubmit={bulkInvite}
          className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5 space-y-3"
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Users className="w-4 h-4 text-[#FFCC00]" />
            Invitations en masse
          </div>
          <textarea
            rows={3}
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            placeholder="un e-mail par ligne…"
            className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] focus:border-[#FFCC00] focus:outline-none text-sm font-mono"
          />
          <button
            type="submit"
            disabled={!bulk.trim() || isPending}
            className="px-4 py-2 rounded-lg bg-[#FFCC00] text-black font-semibold disabled:opacity-60 hover:scale-[1.02] transition"
          >
            Envoyer les invitations
          </button>
        </form>
      </div>

      {msg ? <div className="text-sm text-green-400">{msg}</div> : null}
      {err ? <div className="text-sm text-red-400">{err}</div> : null}

      <div className="rounded-2xl border border-[#30363d] bg-[#161b22] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0d1117] text-gray-400 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">E-mail</th>
                <th className="px-4 py-3 text-left">Nom</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-left">Invité le</th>
                <th className="px-4 py-3 text-left">Activé le</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d]">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Aucun utilisateur.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#1b222c]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {u.email}
                        {u.is_admin ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FFCC00]/15 text-[#FFCC00] border border-[#FFCC00]/40 font-mono">
                            ADMIN
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {u.display_name || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={u.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {u.invited_at
                        ? new Date(u.invited_at).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {u.activated_at
                        ? new Date(u.activated_at).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {u.status !== 'active' ? (
                          <button
                            onClick={() => reinvite(u.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#30363d] hover:border-[#FFCC00]/60 text-xs transition"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Renvoyer
                          </button>
                        ) : null}
                        {u.status !== 'revoked' && !u.is_admin ? (
                          <button
                            onClick={() => revoke(u.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/10 text-xs transition"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            Révoquer
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
