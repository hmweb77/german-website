import { LEVEL_COLORS } from '@/lib/format';

export default function LevelBadge({ level, className = '' }) {
  const c = LEVEL_COLORS[level] || LEVEL_COLORS['A1.1'];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-mono font-semibold ${c.pill} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {level}
    </span>
  );
}
