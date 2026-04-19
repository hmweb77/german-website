'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import LevelBadge from '@/components/app/LevelBadge';
import { LEVELS } from '@/lib/format';

export default function CoursesManager({ courses }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');

  async function togglePublish(course) {
    const res = await fetch(`/api/admin/courses/${course.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !course.is_published }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || 'Échec');
      return;
    }
    startTransition(() => router.refresh());
  }

  async function remove(course) {
    if (!confirm(`Supprimer le cours "${course.title}" ? Cela supprimera aussi ses leçons.`))
      return;
    const res = await fetch(`/api/admin/courses/${course.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || 'Échec');
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Cours</h1>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFCC00] text-black font-semibold hover:scale-[1.02] transition"
        >
          <Plus className="w-4 h-4" />
          Nouveau cours
        </button>
      </div>

      {error ? <div className="text-sm text-red-400">{error}</div> : null}

      <div className="rounded-2xl border border-[#30363d] bg-[#161b22] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0d1117] text-gray-400 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Titre</th>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-left">Niveau</th>
                <th className="px-4 py-3 text-left">Leçons</th>
                <th className="px-4 py-3 text-left">Publié</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d]">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Aucun cours pour le moment.
                  </td>
                </tr>
              ) : (
                courses.map((c) => (
                  <tr key={c.id} className="hover:bg-[#1b222c]">
                    <td className="px-4 py-3 font-medium">{c.title}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{c.slug}</td>
                    <td className="px-4 py-3">
                      <LevelBadge level={c.level} />
                    </td>
                    <td className="px-4 py-3 text-gray-400 font-mono">{c.lesson_count}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => togglePublish(c)}
                        className={`px-2.5 py-1 rounded-full text-xs border transition ${
                          c.is_published
                            ? 'border-green-500/40 bg-green-500/15 text-green-300'
                            : 'border-gray-500/40 bg-gray-500/10 text-gray-400'
                        }`}
                      >
                        {c.is_published ? 'Publié' : 'Brouillon'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/courses/${c.slug}`}
                          className="px-2.5 py-1 rounded-lg border border-[#30363d] hover:border-[#FFCC00]/60 text-xs transition"
                        >
                          Gérer les leçons
                        </Link>
                        <button
                          onClick={() => remove(c)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/10 text-xs transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showNew ? (
        <NewCourseModal
          onClose={() => setShowNew(false)}
          onSaved={() => {
            setShowNew(false);
            startTransition(() => router.refresh());
          }}
        />
      ) : null}
    </div>
  );
}

function NewCourseModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    level: 'A1.1',
    order_index: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          order_index: Number(form.order_index) || 0,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur');
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl bg-[#161b22] border border-[#30363d] p-6 space-y-4"
      >
        <h2 className="text-lg font-bold">Nouveau cours</h2>
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
          Slug (URL)
          <input
            required
            pattern="[a-z0-9\-]+"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="a1-1"
            className="mt-1 w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] focus:border-[#FFCC00] focus:outline-none font-mono"
          />
        </label>
        <label className="block text-sm">
          Niveau
          <select
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
            className="mt-1 w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] focus:border-[#FFCC00] focus:outline-none"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Description
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] focus:border-[#FFCC00] focus:outline-none"
          />
        </label>
        <label className="block text-sm">
          Ordre
          <input
            type="number"
            value={form.order_index}
            onChange={(e) => setForm({ ...form, order_index: e.target.value })}
            className="mt-1 w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] focus:border-[#FFCC00] focus:outline-none font-mono"
          />
        </label>
        {error ? <div className="text-sm text-red-400">{error}</div> : null}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#30363d] hover:border-[#FFCC00]/60 text-sm transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#FFCC00] text-black font-semibold text-sm disabled:opacity-60 hover:scale-[1.02] transition"
          >
            {loading ? 'Création…' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
}
