"use client";

import Link from "next/link";
import { useState } from "react";
import { readinessQuestions } from "@/data/readiness-questions";
import { answerScale, scoreReadiness } from "@/lib/readiness";
import { AnalyticsEvent, track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function ReadinessAssessment() {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);

  const total = readinessQuestions.length;
  const question = readinessQuestions[index];
  const result = finished ? scoreReadiness(answers) : null;

  const start = () => {
    setStarted(true);
    track(AnalyticsEvent.AssessmentStart);
  };

  const answer = (value: number) => {
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    if (index + 1 >= total) {
      setFinished(true);
      track(AnalyticsEvent.AssessmentComplete, {
        overall: scoreReadiness(next).overall,
      });
    } else {
      setIndex(index + 1);
    }
  };

  if (!started) {
    return (
      <div className="card-surface mx-auto max-w-xl p-8 text-center">
        <p className="mono-label uppercase text-faint">AI readiness assessment</p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight">
          Ten questions. Two minutes. One honest baseline.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">
          Covers process, data, infrastructure, opportunity and governance
          readiness. You&apos;ll get category scores and a recommended next step.
        </p>
        <button
          type="button"
          onClick={start}
          className="mt-7 inline-flex min-h-11 items-center rounded-md bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
        >
          Start the Assessment
        </button>
        <p className="mt-4 text-[11px] text-faint">
          Indicative self-assessment — not an audited methodology. No personal
          data is collected.
        </p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="card-surface mx-auto max-w-2xl p-6 md:p-10" aria-live="polite">
        <p className="mono-label uppercase text-faint">AI readiness score</p>
        <div className="mt-3 flex items-end gap-3">
          <span className="font-mono text-6xl font-bold tabular-nums tracking-tight">
            {result.overall}
          </span>
          <span className="pb-2 text-muted">/ 100</span>
        </div>

        <dl className="mt-8 space-y-4">
          {result.categories.map((category) => (
            <div key={category.key}>
              <div className="flex items-baseline justify-between text-sm">
                <dt>{category.label}</dt>
                <dd className="font-mono tabular-nums">{category.score}</dd>
              </div>
              <div
                role="meter"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={category.score}
                aria-label={category.label}
                className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface2"
              >
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${category.score}%` }}
                />
              </div>
            </div>
          ))}
        </dl>

        <div className="mt-8 rounded-lg border border-accent/40 bg-accent/10 p-5">
          <p className="text-sm leading-relaxed">{result.recommendation}</p>
          <p className="mono-label mt-3 uppercase text-accent-strong">
            Recommended next step
          </p>
          <p className="mt-1 font-medium">{result.recommendedNextStep}</p>
        </div>

        <p className="mt-5 text-[11px] leading-relaxed text-faint">
          Scores are indicative estimates derived from self-reported answers.
          A validated assessment requires workshops with your teams.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/start-a-project"
            onClick={() => track(AnalyticsEvent.CtaClick, { location: "readiness-result" })}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-strong"
          >
            Discuss My Result
          </Link>
          <button
            type="button"
            onClick={() => {
              setAnswers({});
              setIndex(0);
              setFinished(false);
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-line-strong px-5 py-2.5 text-sm hover:border-accent"
          >
            Retake
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card-surface mx-auto max-w-2xl p-6 md:p-10">
      <div className="flex items-center justify-between">
        <p className="mono-label uppercase text-faint">
          Question {index + 1} / {total}
        </p>
        <div
          role="progressbar"
          aria-valuenow={index}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label="Assessment progress"
          className="h-1 w-28 overflow-hidden rounded-full bg-surface2"
        >
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${(index / total) * 100}%` }}
          />
        </div>
      </div>

      <fieldset className="mt-8">
        <legend className="text-xl font-semibold leading-snug">
          {question.question}
        </legend>
        <p className="mt-2 text-sm text-muted">{question.help}</p>
        <div className="mt-6 flex flex-col gap-2">
          {answerScale.map((label, value) => (
            <button
              key={label}
              type="button"
              onClick={() => answer(value)}
              className={cn(
                "flex min-h-11 items-center justify-between rounded-md border px-4 py-2.5 text-left text-sm transition-colors",
                answers[question.id] === value
                  ? "border-accent bg-accent/10 text-accent-strong"
                  : "border-line bg-surface2 hover:border-line-strong",
              )}
            >
              {label}
              <span className="font-mono text-xs text-faint">{value}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {index > 0 && (
        <button
          type="button"
          onClick={() => setIndex(index - 1)}
          className="mt-6 mono-label uppercase text-muted hover:text-ink"
        >
          ← Previous
        </button>
      )}
    </div>
  );
}
