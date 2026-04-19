'use client';

import { useEffect, useRef, useState } from 'react';
import { NotebookPen } from 'lucide-react';

export default function NotesPanel({ lessonId, initialContent = '' }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [savedAt, setSavedAt] = useState(null);
  const timer = useRef(null);
  const lastSaved = useRef(initialContent);

  function save(value) {
    if (value === lastSaved.current) return;
    lastSaved.current = value;
    fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lesson_id: lessonId, content: value }),
    })
      .then(() => setSavedAt(new Date()))
      .catch(() => {});
  }

  function onChange(e) {
    const value = e.target.value;
    setContent(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => save(value), 800);
  }

  function onBlur() {
    if (timer.current) clearTimeout(timer.current);
    save(content);
  }

  useEffect(() => () => timer.current && clearTimeout(timer.current), []);

  return (
    <section className="rounded-2xl border border-[#30363d] bg-[#161b22]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-sm font-semibold text-[#e6edf3]"
      >
        <span className="inline-flex items-center gap-2">
          <NotebookPen className="w-4 h-4 text-[#FFCC00]" />
          Mes notes
        </span>
        <span className="text-xs text-gray-500 font-mono">
          {savedAt ? `Enregistré à ${savedAt.toLocaleTimeString('fr-FR')}` : open ? 'Auto-enregistrement' : ''}
          <span className="ml-2">{open ? '▴' : '▾'}</span>
        </span>
      </button>
      {open ? (
        <div className="px-5 pb-5">
          <textarea
            value={content}
            onChange={onChange}
            onBlur={onBlur}
            rows={6}
            placeholder="Prenez vos notes sur cette leçon…"
            className="w-full p-3 rounded-xl bg-[#0d1117] border border-[#30363d] focus:border-[#FFCC00] focus:outline-none transition text-sm leading-relaxed"
          />
        </div>
      ) : null}
    </section>
  );
}
