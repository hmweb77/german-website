import Link from 'next/link';
import { Lock } from 'lucide-react';
import LevelBadge from './LevelBadge';
import ProgressBar from './ProgressBar';

export default function LevelCard({ level, course, lessonCount = 0, completion = 0 }) {
  const locked = !course || !course.is_published;

  const Wrapper = locked ? 'div' : Link;
  const wrapperProps = locked ? {} : { href: `/courses/${course.slug}` };

  return (
    <Wrapper
      {...wrapperProps}
      className={`group relative block rounded-2xl border p-5 transition ${
        locked
          ? 'border-[#21262d] bg-[#0d1117]/60 cursor-not-allowed'
          : 'border-[#30363d] bg-[#161b22] hover:border-[#FFCC00]/60 hover:bg-[#1b222c]'
      }`}
    >
      <div className="flex items-center justify-between">
        <LevelBadge level={level} />
        {locked ? (
          <Lock className="w-4 h-4 text-gray-500" />
        ) : (
          <span className="text-xs text-gray-400 font-mono">
            {Math.round(completion)}%
          </span>
        )}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[#e6edf3]">
        {course?.title || `Deutsch ${level}`}
      </h3>
      <p className="mt-1 text-sm text-gray-400 line-clamp-2">
        {course?.description || 'Bientôt disponible.'}
      </p>
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500 font-mono">
        <span>{lessonCount} leçons</span>
        {locked ? <span>Verrouillé</span> : <span>Continuer →</span>}
      </div>
      {!locked ? (
        <div className="mt-3">
          <ProgressBar value={completion} />
        </div>
      ) : null}
    </Wrapper>
  );
}
