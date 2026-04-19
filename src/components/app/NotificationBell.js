'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';

function formatRelative(dateStr) {
  const d = new Date(dateStr);
  const diffMin = Math.round((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  return `il y a ${diffD} j`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    fetch('/api/notifications/latest')
      .then((r) => r.json())
      .then((data) => {
        if (data.items) {
          setItems(data.items);
          setUnread(data.unread || 0);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      const ids = items.filter((i) => !i.read).map((i) => i.id);
      if (ids.length) {
        await fetch('/api/notifications/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids }),
        });
        setUnread(0);
        setItems((prev) => prev.map((i) => ({ ...i, read: true })));
      }
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggleOpen}
        className="relative w-9 h-9 rounded-full bg-[#161b22] border border-[#30363d] text-gray-300 hover:text-[#FFCC00] hover:border-[#FFCC00]/40 flex items-center justify-center transition"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 ? (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-[#FFCC00] text-black rounded-full text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto bg-[#161b22] border border-[#30363d] rounded-xl shadow-xl">
          <div className="px-4 py-3 border-b border-[#30363d] text-sm font-semibold">
            Notifications
          </div>
          {items.length === 0 ? (
            <div className="px-4 py-6 text-sm text-gray-500 text-center">
              Aucune notification
            </div>
          ) : (
            <ul className="divide-y divide-[#21262d]">
              {items.map((n) => (
                <li key={n.id} className="px-4 py-3">
                  <div className="text-sm font-medium text-[#e6edf3]">
                    {n.title}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                    {n.body}
                  </div>
                  <div className="text-[11px] text-gray-600 mt-1 font-mono">
                    {formatRelative(n.created_at)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
