'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const LEVELS = ['A1.1', 'A1.2', 'A2.1', 'A2.2'];

export default function CourseEditor({ course, lessons }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [form, setForm] = useState({
    title: course.title || '',
    description: course.description || '',
    level: course.level,
    is_published: !!course.is_published,
  });
  const [saving, setSaving] = useState(false);
  const [publishingAll, setPublishingAll] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const dirty =
    form.title !== (course.title || '') ||
    form.description !== (course.description || '') ||
    form.level !== course.level ||
    form.is_published !== !!course.is_published;

  async function save(e) {
    e?.preventDefault();
    setMsg('');
    setErr('');
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/courses/${course.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          level: form.level,
          is_published: form.is_published,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Échec de la mise à jour');
      setMsg('Cours mis à jour.');
      startTransition(() => router.refresh());
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setSaving(false);
    }
  }

  // Bulk-publish the course and every draft lesson it contains. This is the
  // "make it visible to students now" button — students can't see anything
  // while either the course or its lessons are drafts.
  async function publishEverything() {
    const drafts = (lessons || []).filter((l) => !l.is_published);
    if (!drafts.length && course.is_published) {
      setMsg('Tout est déjà publié.');
      return;
    }
    if (
      !confirm(
        `Publier le cours "${course.title}" et ${drafts.length} leçon(s) en brouillon ?`
      )
    )
      return;
    setErr('');
    setMsg('');
    setPublishingAll(true);
    try {
      if (!course.is_published) {
        const res = await fetch(`/api/admin/courses/${course.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_published: true }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || 'Impossible de publier le cours');
        }
      }
      // Fire lesson patches sequentially — the set is small (≤ a few dozen)
      // and sequential keeps the error surface simple.
      for (const l of drafts) {
        const res = await fetch(`/api/admin/lessons/${l.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_published: true }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || `Échec sur "${l.title}"`);
        }
      }
      setForm((f) => ({ ...f, is_published: true }));
      setMsg(
        `Cours${drafts.length ? ` et ${drafts.length} leçon(s)` : ''} publié${
          drafts.length ? 's' : ''
        }.`
      );
      startTransition(() => router.refresh());
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setPublishingAll(false);
    }
  }

  const draftLessonCount = (lessons || []).filter((l) => !l.is_published).length;
  const needsBulk = !course.is_published || draftLessonCount > 0;

  return (
    <form
      onSubmit={save}
      className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5 space-y-4"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full border border-[#FFCC00]/40 text-[#FFCC00] font-mono">
            {form.level}
          </span>
          <span className="text-xs text-gray-500 font-mono">/{course.slug}</span>
          <span
            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
              form.is_published
                ? 'border-green-500/40 bg-green-500/15 text-green-300'
                : 'border-gray-500/40 bg-gray-500/10 text-gray-400'
            }`}
          >
            {form.is_published ? (
              <>
                <Eye className="w-3 h-3" /> Publié
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3" /> Brouillon
              </>
            )}
          </span>
        </div>
        {needsBulk ? (
          <button
            type="button"
            onClick={publishEverything}
            disabled={publishingAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFCC00] text-black font-semibold text-xs disabled:opacity-60 hover:scale-[1.02] transition"
            title="Rend le cours et toutes ses leçons visibles pour les étudiants"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {publishingAll
              ? 'Publication…'
              : `Publier ce cours et ${draftLessonCount} leçon${
                  draftLessonCount > 1 ? 's' : ''
                }`}
          </button>
        ) : null}
      </div>

      <label className="block text-sm">
        <span className="text-gray-400">Titre</span>
        <input
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="mt-1 w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] focus:border-[#FFCC00] focus:outline-none text-lg font-semibold"
        />
      </label>

      <label className="block text-sm">
        <span className="text-gray-400">Description</span>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="mt-1 w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] focus:border-[#FFCC00] focus:outline-none"
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block text-sm">
          <span className="text-gray-400">Niveau</span>
          <select
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
            className="mt-1 w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] focus:border-[#FFCC00] focus:outline-none"
          >
            {LEVELS.map((lv) => (
              <option key={lv} value={lv}>
                {lv}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm mt-6">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
            className="w-4 h-4 accent-[#FFCC00]"
          />
          <span>
            Publié — visible pour les étudiants
          </span>
        </label>
      </div>

      {msg ? <div className="text-sm text-green-400">{msg}</div> : null}
      {err ? <div className="text-sm text-red-400">{err}</div> : null}

      <div className="flex items-center justify-end gap-2">
        <button
          type="submit"
          disabled={!dirty || saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FFCC00] text-black font-semibold text-sm disabled:opacity-60 hover:scale-[1.02] transition"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}
