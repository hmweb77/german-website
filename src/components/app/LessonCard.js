import Link from 'next/link';
import { CheckCircle2, PlayCircle } from 'lucide-react';
import { formatDuration } from '@/lib/format';

export default function LessonCard({ lesson, courseSlug, progress }) {
  const completed = progress?.completed === true;
  const inProgress = !completed && (progress?.watched_seconds || 0) > 0;

  return (
    <Link
      href={`/courses/${courseSlug}/lessons/${lesson.id}`}
      className={`flex gap-4 p-4 rounded-2xl border transition group ${
        inProgress
          ? 'border-[#FFCC00]/60 bg-[#1b222c]'
          : 'border-[#30363d] bg-[#161b22] hover:border-[#FFCC00]/40 hover:bg-[#1b222c]'
      }`}
    >
      <div className="relative w-28 md:w-40 aspect-video rounded-xl overflow-hidden bg-[#0d1117] border border-[#21262d] flex-shrink-0">
        {lesson.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={lesson.thumbnail_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <PlayCircle className="w-8 h-8" />
          </div>
        )}
        {completed ? (
          <div className="absolute top-1.5 right-1.5 bg-green-500 text-black rounded-full p-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        ) : null}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-[#e6edf3] leading-tight">
          {lesson.title}
        </h3>
        <p className="mt-1 text-sm text-gray-400 line-clamp-2">
          {lesson.description}
        </p>
        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 font-mono">
          <span>{formatDuration(lesson.duration_seconds)}</span>
          {inProgress ? <span className="text-[#FFCC00]">En cours</span> : null}
          {completed ? <span className="text-green-400">Terminé</span> : null}
        </div>
      </div>
    </Link>
  );
}
