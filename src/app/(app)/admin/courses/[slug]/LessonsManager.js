'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, UploadCloud, PlayCircle, Link as LinkIcon } from 'lucide-react';
import { formatDuration } from '@/lib/format';

function SortableRow({ lesson, onEdit, onDelete, onTogglePublish, onUpload }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lesson.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 rounded-xl border border-[#30363d] bg-[#161b22]"
    >
      <button
        {...attributes}
        {...listeners}
        className="p-1 text-gray-500 hover:text-[#FFCC00] cursor-grab active:cursor-grabbing"
        aria-label="Réordonner"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="relative w-20 aspect-video rounded-lg overflow-hidden bg-[#0d1117] border border-[#21262d] flex-shrink-0">
        {lesson.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={lesson.thumbnail_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <PlayCircle className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{lesson.title}</div>
        <div className="text-xs text-gray-500 font-mono mt-0.5">
          {lesson.cloudflare_video_id ? (
            <>
              CF: {lesson.cloudflare_video_id.slice(0, 10)}… ·{' '}
              {formatDuration(lesson.duration_seconds)}
            </>
          ) : (
            'Aucune vidéo'
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onTogglePublish(lesson)}
          className={`px-2.5 py-1 rounded-full text-xs border transition ${
            lesson.is_published
              ? 'border-green-500/40 bg-green-500/15 text-green-300'
              : 'border-gray-500/40 bg-gray-500/10 text-gray-400'
          }`}
        >
          {lesson.is_published ? 'Publié' : 'Brouillon'}
        </button>
        <button
          onClick={() => onUpload(lesson)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#30363d] hover:border-[#FFCC00]/60 text-xs transition"
          title={lesson.cloudflare_video_id ? 'Remplacer la vidéo' : 'Uploader une vidéo'}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          {lesson.cloudflare_video_id ? 'Remplacer' : 'Uploader'}
        </button>
        <button
          onClick={() => onEdit(lesson)}
          className="px-2.5 py-1 rounded-lg border border-[#30363d] hover:border-[#FFCC00]/60 text-xs transition"
        >
          Éditer
        </button>
        <button
          onClick={() => onDelete(lesson)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/10 text-xs transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function LessonsManager({ courseId, initialLessons }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [lessons, setLessons] = useState(initialLessons);
  const [panel, setPanel] = useState(null); // { mode: 'new'|'edit'|'upload', lesson? }
  const [error, setError] = useState('');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  async function onDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = lessons.findIndex((l) => l.id === active.id);
    const newIdx = lessons.findIndex((l) => l.id === over.id);
    const next = arrayMove(lessons, oldIdx, newIdx).map((l, i) => ({
      ...l,
      order_index: i,
    }));
    setLessons(next);

    const payload = next.map((l) => ({ id: l.id, order_index: l.order_index }));
    const res = await fetch('/api/admin/lessons/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: payload }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || 'Échec de la réorganisation');
    }
  }

  async function togglePublish(lesson) {
    const res = await fetch(`/api/admin/lessons/${lesson.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !lesson.is_published }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || 'Échec');
      return;
    }
    setLessons((prev) =>
      prev.map((l) => (l.id === lesson.id ? { ...l, is_published: !l.is_published } : l))
    );
  }

  async function removeLesson(lesson) {
    if (!confirm(`Supprimer la leçon "${lesson.title}" ?`)) return;
    const res = await fetch(`/api/admin/lessons/${lesson.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || 'Échec');
      return;
    }
    setLessons((prev) => prev.filter((l) => l.id !== lesson.id));
    startTransition(() => router.refresh());
  }

  function openNew() {
    setPanel({ mode: 'new' });
  }
  function openEdit(lesson) {
    setPanel({ mode: 'edit', lesson });
  }
  function openUpload(lesson) {
    setPanel({ mode: 'upload', lesson });
  }

  function afterSave(savedLesson, mode) {
    setLessons((prev) => {
      if (mode === 'new') return [...prev, savedLesson];
      return prev.map((l) => (l.id === savedLesson.id ? { ...l, ...savedLesson } : l));
    });
    setPanel(null);
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Leçons</h2>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFCC00] text-black font-semibold hover:scale-[1.02] transition"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {error ? <div className="text-sm text-red-400">{error}</div> : null}

      {lessons.length === 0 ? (
        <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-8 text-center text-gray-500">
          Aucune leçon.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {lessons.map((l) => (
                <SortableRow
                  key={l.id}
                  lesson={l}
                  onEdit={openEdit}
                  onDelete={removeLesson}
                  onTogglePublish={togglePublish}
                  onUpload={openUpload}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {panel?.mode === 'new' || panel?.mode === 'edit' ? (
        <LessonPanel
          courseId={courseId}
          lesson={panel.lesson}
          onClose={() => setPanel(null)}
          onSaved={afterSave}
          mode={panel.mode}
        />
      ) : null}
      {panel?.mode === 'upload' ? (
        <UploadPanel
          lesson={panel.lesson}
          onClose={() => setPanel(null)}
          onUploaded={(updated) => afterSave(updated, 'edit')}
        />
      ) : null}
    </div>
  );
}

function LessonPanel({ courseId, lesson, mode, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: lesson?.title || '',
    description: lesson?.description || '',
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      const url = mode === 'new' ? '/api/admin/lessons' : `/api/admin/lessons/${lesson.id}`;
      const method = mode === 'new' ? 'POST' : 'PATCH';
      const body =
        mode === 'new'
          ? { course_id: courseId, title: form.title, description: form.description }
          : { title: form.title, description: form.description };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur');
      onSaved(json.lesson, mode);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl bg-[#161b22] border border-[#30363d] p-6 space-y-4"
      >
        <h2 className="text-lg font-bold">
          {mode === 'new' ? 'Nouvelle leçon' : 'Modifier la leçon'}
        </h2>
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
          Description
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] focus:border-[#FFCC00] focus:outline-none"
          />
        </label>
        {err ? <div className="text-sm text-red-400">{err}</div> : null}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-[#30363d] hover:border-[#FFCC00]/60 text-sm transition">
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#FFCC00] text-black font-semibold text-sm disabled:opacity-60 hover:scale-[1.02] transition"
          >
            {loading ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}

function UploadPanel({ lesson, onClose, onUploaded }) {
  const [tab, setTab] = useState('upload'); // 'upload' | 'link'
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | requesting | uploading | processing | done | error
  const [progress, setProgress] = useState(0);
  const [err, setErr] = useState('');
  const [updated, setUpdated] = useState(lesson);

  // UID-linking state
  const [uidInput, setUidInput] = useState('');
  const [linkStatus, setLinkStatus] = useState('idle'); // idle | linking | done | error
  const [linkMsg, setLinkMsg] = useState('');

  async function upload() {
    if (!file) return;
    setErr('');
    setStatus('requesting');
    try {
      const r1 = await fetch(`/api/admin/lessons/${lesson.id}/upload-url`, {
        method: 'POST',
      });
      const j1 = await r1.json();
      if (!r1.ok) throw new Error(j1.error || 'Impossible d\'obtenir l\'URL d\'upload');

      setStatus('uploading');
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', j1.uploadURL);
        const fd = new FormData();
        fd.append('file', file);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress((e.loaded / e.total) * 100);
        };
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload ${xhr.status}`)));
        xhr.onerror = () => reject(new Error('Upload network error'));
        xhr.send(fd);
      });

      setStatus('processing');
      // Poll a few times; CF webhook will also catch it, so this is a nicety
      // for the admin UI — after ~30s give up and rely on the webhook.
      for (let i = 0; i < 15; i += 1) {
        await new Promise((r) => setTimeout(r, 2000));
        const rs = await fetch(`/api/admin/lessons/${lesson.id}`);
        const js = await rs.json().catch(() => ({}));
        if (rs.ok && js.lesson?.duration_seconds) {
          setUpdated(js.lesson);
          setStatus('done');
          onUploaded(js.lesson);
          return;
        }
      }
      setStatus('done');
      onUploaded({ ...lesson, cloudflare_video_id: j1.uid });
    } catch (e) {
      setErr(e.message);
      setStatus('error');
    }
  }

  async function linkUid() {
    if (!uidInput.trim()) return;
    setLinkMsg('');
    setLinkStatus('linking');
    try {
      const res = await fetch(`/api/admin/lessons/${lesson.id}/link-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cloudflare_video_id: uidInput }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Impossible de lier la vidéo');
      setUpdated(json.lesson);
      setLinkStatus('done');
      setLinkMsg(
        json.readyToStream
          ? 'Vidéo liée et prête à diffuser.'
          : `Vidéo liée (statut Cloudflare: ${json.state || 'en cours'}). La miniature et la durée seront complétées dès que la vidéo sera prête.`
      );
      onUploaded(json.lesson);
    } catch (e) {
      setLinkMsg(e.message);
      setLinkStatus('error');
    }
  }

  const tabBtn = (key, label) => (
    <button
      type="button"
      onClick={() => setTab(key)}
      className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition ${
        tab === key
          ? 'bg-[#FFCC00] text-black'
          : 'border border-[#30363d] text-gray-300 hover:border-[#FFCC00]/60'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-[#161b22] border border-[#30363d] p-6 space-y-4"
      >
        <h2 className="text-lg font-bold">
          {lesson.cloudflare_video_id ? 'Remplacer la vidéo' : 'Ajouter une vidéo'}
        </h2>

        <div className="flex items-center gap-2">
          {tabBtn('upload', 'Téléverser un fichier')}
          {tabBtn('link', 'Lier une vidéo existante')}
        </div>

        {tab === 'upload' ? (
          <>
            <p className="text-sm text-gray-400">
              La vidéo est envoyée directement à Cloudflare Stream (elle ne passe pas par notre serveur).
            </p>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#FFCC00] file:text-black file:font-semibold"
            />
            {status === 'uploading' ? (
              <div>
                <div className="w-full h-2 bg-[#21262d] rounded-full overflow-hidden">
                  <div className="h-full bg-[#FFCC00] transition-all" style={{ width: `${progress}%` }} />
                </div>
                <div className="text-xs text-gray-500 mt-1 font-mono">
                  Envoi à Cloudflare: {Math.round(progress)}%
                </div>
              </div>
            ) : null}
            {status === 'processing' ? (
              <div className="text-sm text-gray-400">
                Cloudflare traite la vidéo… (durée et miniature bientôt disponibles)
              </div>
            ) : null}
            {status === 'done' ? (
              <div className="text-sm text-green-400">
                Vidéo envoyée !{' '}
                {updated?.duration_seconds
                  ? `Durée: ${Math.round(updated.duration_seconds)}s`
                  : 'Métadonnées en cours via webhook.'}
              </div>
            ) : null}
            {err ? <div className="text-sm text-red-400">{err}</div> : null}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-[#30363d] hover:border-[#FFCC00]/60 text-sm transition"
              >
                Fermer
              </button>
              <button
                onClick={upload}
                disabled={!file || status === 'uploading' || status === 'requesting' || status === 'processing'}
                className="px-4 py-2 rounded-lg bg-[#FFCC00] text-black font-semibold text-sm disabled:opacity-60 hover:scale-[1.02] transition"
              >
                {status === 'idle' || status === 'error' ? 'Envoyer' : 'En cours…'}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-400">
              Collez l&apos;UID d&apos;une vidéo déjà présente dans votre compte Cloudflare Stream
              (32 caractères hex). Vous pouvez aussi coller l&apos;URL complète — l&apos;UID sera extrait automatiquement.
            </p>
            <label className="block text-sm">
              UID Cloudflare
              <input
                value={uidInput}
                onChange={(e) => setUidInput(e.target.value)}
                placeholder="ex. b59c5c51b..."
                autoFocus
                className="mt-1 w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] focus:border-[#FFCC00] focus:outline-none font-mono text-sm"
              />
            </label>
            {linkStatus === 'done' ? (
              <div className="text-sm text-green-400">{linkMsg}</div>
            ) : null}
            {linkStatus === 'error' ? (
              <div className="text-sm text-red-400">{linkMsg}</div>
            ) : null}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-[#30363d] hover:border-[#FFCC00]/60 text-sm transition"
              >
                Fermer
              </button>
              <button
                onClick={linkUid}
                disabled={!uidInput.trim() || linkStatus === 'linking'}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FFCC00] text-black font-semibold text-sm disabled:opacity-60 hover:scale-[1.02] transition"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                {linkStatus === 'linking' ? 'Liaison…' : 'Lier la vidéo'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
