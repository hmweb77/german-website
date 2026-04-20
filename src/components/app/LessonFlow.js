'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import VideoPlayer from '@/components/app/VideoPlayer';
import LessonQuiz from '@/components/app/LessonQuiz';

/**
 * Client-side wrapper owning the per-lesson interaction flow:
 *   VideoPlayer -> (on complete) LessonQuiz (below the video, above the notes)
 * When the user clicks "Marquer comme terminé" in the video player we reveal
 * a 5-question Arabic quiz. On a perfect score the user gets a "الدرس التالي"
 * button that navigates to the next lesson. If no quiz is configured for the
 * lesson, the user just uses the normal "Leçon suivante" link in the footer.
 */
export default function LessonFlow({
  lessonId,
  signedToken,
  initialWatchedSeconds = 0,
  initialCompleted = false,
  durationSeconds = 0,
  quiz,
  nextHref,
}) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompleted);
  const [quizPassed, setQuizPassed] = useState(false);

  const showQuiz = Boolean(quiz) && completed && !quizPassed;

  function handlePassed() {
    setQuizPassed(true);
    if (nextHref) router.push(nextHref);
  }

  return (
    <>
      <VideoPlayer
        lessonId={lessonId}
        signedToken={signedToken}
        initialWatchedSeconds={initialWatchedSeconds}
        initialCompleted={initialCompleted}
        durationSeconds={durationSeconds}
        onCompleted={() => setCompleted(true)}
      />
      {showQuiz ? (
        <LessonQuiz
          questions={quiz}
          onPassed={handlePassed}
          hasNext={Boolean(nextHref)}
        />
      ) : null}
    </>
  );
}
