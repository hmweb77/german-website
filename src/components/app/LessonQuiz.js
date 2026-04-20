'use client';

import { useState } from 'react';
import { GraduationCap, CheckCircle2, RefreshCw, Check, X } from 'lucide-react';

const PASS_BAR = 5; // must answer all 5 correctly to pass

/**
 * Renders a 5-question, single-answer multiple-choice quiz (RTL, Arabic).
 * Flow per question:
 *   1. User selects an option and clicks "التالي" → options freeze and the
 *      correct answer is shown in green; a wrong selection is shown in red.
 *   2. User clicks "التالي" again to move on (or "إنهاء" on the last step).
 * On a perfect score the component shows a success state with a "next lesson"
 * button that calls onPassed(). Sub-par scores offer a retry. No backend
 * persistence — state is in-component only.
 */
export default function LessonQuiz({ questions, onPassed, hasNext = true }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(() => Array(questions.length).fill(null));
  const [revealed, setRevealed] = useState(false);

  const isResult = step >= questions.length;
  const score = isResult
    ? answers.reduce((n, a, i) => (a === questions[i].correctIndex ? n + 1 : n), 0)
    : 0;
  const passed = isResult && score >= PASS_BAR;

  function selectOption(optionIndex) {
    if (revealed) return;
    setAnswers((prev) => {
      const copy = prev.slice();
      copy[step] = optionIndex;
      return copy;
    });
  }

  function handlePrimaryClick() {
    if (!revealed) {
      setRevealed(true);
      return;
    }
    setRevealed(false);
    setStep((s) => s + 1);
  }

  function reset() {
    setStep(0);
    setAnswers(Array(questions.length).fill(null));
    setRevealed(false);
  }

  return (
    <section
      dir="rtl"
      className="rounded-2xl border border-[#30363d] bg-[#161b22] px-5 py-5"
    >
      <div className="flex items-center justify-between mb-4" dir="rtl">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#e6edf3]">
          <GraduationCap className="w-4 h-4 text-[#FFCC00]" />
          اختبار قصير
        </div>
        <div className="flex items-center gap-1.5" dir="ltr">
          {questions.map((_, i) => {
            const active = !isResult && i === step;
            const done = !isResult ? i < step : true;
            return (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition ${
                  active
                    ? 'bg-[#FFCC00]'
                    : done
                    ? 'bg-[#FFCC00]/50'
                    : 'bg-[#30363d]'
                }`}
              />
            );
          })}
        </div>
      </div>

      {!isResult ? (
        <div>
          <div className="text-xs text-gray-500 font-mono mb-2">
            السؤال {step + 1} / {questions.length}
          </div>
          <h3 className="text-base md:text-lg font-semibold text-[#e6edf3] mb-4 leading-relaxed">
            {questions[step].question}
          </h3>
          <ul className="space-y-2">
            {questions[step].options.map((opt, i) => {
              const checked = answers[step] === i;
              const correct = i === questions[step].correctIndex;

              let optionClass =
                'border-[#30363d] bg-[#0d1117] text-gray-200 hover:border-[#FFCC00]/50';
              if (revealed) {
                if (correct) {
                  optionClass =
                    'border-green-500 bg-green-500/10 text-green-300';
                } else if (checked && !correct) {
                  optionClass = 'border-red-500 bg-red-500/10 text-red-300';
                } else {
                  optionClass = 'border-[#30363d] bg-[#0d1117] text-gray-500';
                }
              } else if (checked) {
                optionClass =
                  'border-[#FFCC00] bg-[#FFCC00]/10 text-[#FFCC00]';
              }

              return (
                <li key={i}>
                  <label
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition text-sm ${
                      revealed ? 'cursor-default' : 'cursor-pointer'
                    } ${optionClass}`}
                  >
                    <input
                      type="radio"
                      name={`quiz-step-${step}`}
                      className="accent-[#FFCC00]"
                      checked={checked}
                      disabled={revealed}
                      onChange={() => selectOption(i)}
                    />
                    <span className="flex-1">{opt}</span>
                    {revealed && correct ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : revealed && checked && !correct ? (
                      <X className="w-4 h-4 text-red-400" />
                    ) : null}
                  </label>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center justify-end pt-4">
            <button
              onClick={handlePrimaryClick}
              disabled={answers[step] == null}
              className="px-4 py-2 rounded-xl bg-[#FFCC00] text-black font-semibold text-sm disabled:opacity-50 hover:scale-[1.02] transition"
            >
              {!revealed
                ? 'التالي'
                : step === questions.length - 1
                ? 'إنهاء'
                : 'التالي'}
            </button>
          </div>
        </div>
      ) : passed ? (
        <div className="flex flex-col items-center text-center gap-3 py-3">
          <div className="w-12 h-12 rounded-full bg-[#FFCC00]/10 text-[#FFCC00] flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="text-[#FFCC00] font-semibold text-lg">
            أحسنت! أجبت على جميع الأسئلة بشكل صحيح
          </div>
          <div className="text-xs text-gray-400 font-mono">
            النتيجة: {score} / {questions.length}
          </div>
          {hasNext ? (
            <button
              onClick={onPassed}
              className="mt-2 px-5 py-2.5 rounded-xl bg-[#FFCC00] text-black font-semibold text-sm hover:scale-[1.02] transition"
            >
              الدرس التالي
            </button>
          ) : (
            <div className="mt-2 text-sm text-gray-300">
              لقد أنهيت آخر درس في هذا الكورس 🎉
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center text-center gap-3 py-3">
          <div className="text-red-300 font-semibold">
            أجب على جميع الأسئلة بشكل صحيح للمتابعة
          </div>
          <div className="text-xs text-gray-400 font-mono">
            النتيجة: {score} / {questions.length}
          </div>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 mt-1 px-4 py-2 rounded-xl border border-[#FFCC00]/40 text-[#FFCC00] font-semibold text-sm hover:bg-[#FFCC00]/10 transition"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </button>
        </div>
      )}
    </section>
  );
}
