import Link from 'next/link';
import { PlayCircle } from 'lucide-react';
import ProgressBar from './ProgressBar';
import LevelBadge from './LevelBadge';
import { formatDuration } from '@/lib/format';

export default function ContinueWatchingCard({ item }) {
  if (!item) return null;
  const { lesson, course, progress } = item;
  const pct = lesson.duration_seconds
    ? Math.min(100, (progress.watched_seconds / lesson.duration_seconds) * 100)
    : 0;

  return (
    <Link
      href={`/courses/${course.slug}/lessons/${lesson.id}`}
      className="block rounded-2xl border border-[#30363d] bg-gradient-to-br from-[#161b22] to-[#1b222c] p-5 hover:border-[#FFCC00]/60 transition"
    >
      <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wide text-[#FFCC00]">
        <PlayCircle className="w-3.5 h-3.5" />
        Reprendre
      </div>
      <div className="mt-2 flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <LevelBadge level={course.level} />
            <span className="text-xs text-gray-400 truncate">{course.title}</span>
          </div>
          <h3 className="mt-2 text-lg font-semibold text-[#e6edf3] truncate">
            {lesson.title}
          </h3>
          <div className="mt-3">
            <ProgressBar value={pct} />
            <div className="mt-1 flex items-center justify-between text-xs text-gray-500 font-mono">
              <span>
                {formatDuration(progress.watched_seconds)} /{' '}
                {formatDuration(lesson.duration_seconds)}
              </span>
              <span>{Math.round(pct)}%</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
