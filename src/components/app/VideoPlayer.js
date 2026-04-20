'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Cloudflare Stream iframe-based player. Uses a signed token embedded in the
 * src URL. Progress is reported to /api/progress (debounced 10s) and marked
 * complete once ≥90% of duration is watched (or via "Marquer comme terminé").
 *
 * The Stream iframe SDK is loaded on the client to expose a timeupdate-style
 * event via postMessage.
 */
export default function VideoPlayer({
  lessonId,
  signedToken,
  initialWatchedSeconds = 0,
  initialCompleted = false,
  durationSeconds = 0,
  onCompleted,
}) {
  const iframeRef = useRef(null);
  const sdkRef = useRef(null);
  const lastSentRef = useRef(initialWatchedSeconds);
  const lastFlushRef = useRef(Date.now());
  const [completed, setCompleted] = useState(initialCompleted);
  const [watched, setWatched] = useState(initialWatchedSeconds);

  // Stream SDK is preloaded in the (app) layout <head> so window.Stream is
  // usually already available by the time this component mounts. The attach()
  // loop below still polls in case the script is still parsing.

  function flushProgress(value, markCompleted = false) {
    lastSentRef.current = value;
    lastFlushRef.current = Date.now();
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lesson_id: lessonId,
        watched_seconds: Math.round(value),
        completed: markCompleted,
      }),
    }).catch(() => {});
  }

  useEffect(() => {
    let cancelled = false;

    function attach() {
      if (cancelled) return;
      const Stream = window.Stream;
      if (!Stream || !iframeRef.current) {
        setTimeout(attach, 150);
        return;
      }
      const player = Stream(iframeRef.current);
      sdkRef.current = player;

      if (initialWatchedSeconds > 0) {
        try {
          player.currentTime = initialWatchedSeconds;
        } catch {
          // some browsers set it post-metadata; try again on loadedmetadata
          player.addEventListener('loadedmetadata', () => {
            try {
              player.currentTime = initialWatchedSeconds;
            } catch {}
          });
        }
      }

      player.addEventListener('timeupdate', () => {
        const t = player.currentTime || 0;
        setWatched(t);
        const dur =
          durationSeconds || player.duration || 0;
        if (!completed && dur > 0 && t / dur >= 0.9) {
          setCompleted(true);
          flushProgress(t, true);
          onCompleted && onCompleted();
          return;
        }
        if (Date.now() - lastFlushRef.current > 10_000 &&
            Math.abs(t - lastSentRef.current) >= 2) {
          flushProgress(t, false);
        }
      });

      player.addEventListener('pause', () => {
        flushProgress(player.currentTime || 0, completed);
      });
      player.addEventListener('ended', () => {
        setCompleted(true);
        flushProgress(player.currentTime || durationSeconds, true);
        onCompleted && onCompleted();
      });
    }

    attach();
    const onUnload = () => flushProgress(sdkRef.current?.currentTime || watched, completed);
    window.addEventListener('beforeunload', onUnload);
    return () => {
      cancelled = true;
      window.removeEventListener('beforeunload', onUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  function markComplete() {
    if (completed) return;
    setCompleted(true);
    flushProgress(sdkRef.current?.currentTime || watched || durationSeconds, true);
    onCompleted && onCompleted();
  }

  const src = `https://iframe.videodelivery.net/${signedToken}?preload=true`;

  return (
    <div className="space-y-3">
      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-[#30363d]">
        <iframe
          ref={iframeRef}
          src={src}
          title="Leçon"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
      <div className="flex items-center justify-between" dir="rtl">
        <span className="text-xs text-gray-500 font-mono" dir="ltr">
          {completed ? '✓ تم' : `التقدم: ${Math.round(watched)}ث`}
        </span>
        <button
          onClick={markComplete}
          disabled={completed}
          className="px-4 py-2 rounded-xl bg-[#FFCC00] text-black font-semibold text-sm disabled:opacity-60 hover:scale-[1.02] transition"
        >
          {completed ? 'تم إنهاء الدرس' : 'أنهِ الفيديو لاجتياز الاختبار'}
        </button>
      </div>
    </div>
  );
}
