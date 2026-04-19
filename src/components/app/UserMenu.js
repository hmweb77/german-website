'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';

export default function UserMenu({ profile, email }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function signOut() {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

  const initials = (profile?.display_name || email || '?')
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-full bg-[#FFCC00] text-black font-bold text-sm flex items-center justify-center hover:scale-105 transition"
        aria-label="Menu utilisateur"
      >
        {initials}
      </button>
      {open ? (
        <div className="absolute right-0 mt-2 w-60 bg-[#161b22] border border-[#30363d] rounded-xl shadow-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#30363d]">
            <div className="flex items-center gap-2 text-sm text-[#e6edf3] font-semibold">
              <User className="w-4 h-4 text-gray-400" />
              {profile?.display_name || '—'}
            </div>
            <div className="text-xs text-gray-500 truncate mt-0.5">{email}</div>
          </div>
          <button
            onClick={signOut}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-[#1b222c] flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>
      ) : null}
    </div>
  );
}
