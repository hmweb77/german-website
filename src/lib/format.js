export function formatDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds < 0) return '0:00';
  const s = Math.floor(totalSeconds % 60);
  const m = Math.floor((totalSeconds / 60) % 60);
  const h = Math.floor(totalSeconds / 3600);
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export const LEVELS = ['A1', 'A2', 'B1', 'B2'];

export const LEVEL_COLORS = {
  'A1': { pill: 'bg-green-500/15 text-green-300 border-green-500/40', dot: 'bg-green-400' },
  'A2': { pill: 'bg-teal-500/15 text-teal-300 border-teal-500/40', dot: 'bg-teal-400' },
  'B1': { pill: 'bg-blue-500/15 text-blue-300 border-blue-500/40', dot: 'bg-blue-400' },
  'B2': { pill: 'bg-purple-500/15 text-purple-300 border-purple-500/40', dot: 'bg-purple-400' },
};
