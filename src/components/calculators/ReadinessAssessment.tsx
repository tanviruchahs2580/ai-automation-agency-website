"use client";

import Link from "next/link";
import { useState } from "react";
import { readinessQuestions } from "@/data/readiness-questions";
import { answerScale, scoreReadiness } from "@/lib/readiness";
import { AnalyticsEvent, track } from "@/lib/analytics";
import { CountUp } from "@/components/ui/CountUp";
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
          <span className="sr-only">{result.overall} out of 100</span>
          <span aria-hidden="true" className="font-mono text-6xl font-bold tabular-nums tracking-tight">
            <CountUp value={result.overall} />
          </span>
          <span className="pb-2 text-muted">/ 100</span>
        </div>

        <ReadinessRadar
          categories={result.categories.map((c) => ({
            label: c.label,
            score: c.score,
          }))}
        />

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
        </p>        <div
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

/**
 * ReadinessRadar — category scores as a radar chart, not just bars (§15).
 * Static SVG (no motion to reduce), full text equivalent via role="img"
 * label; the bar list below remains the precise representation.
 */
function ReadinessRadar({
  categories,
}: {
  categories: Array<{ label: string; score: number }>;
}) {
  const size = 260;
  const center = size / 2;
  const radius = 92;
  const n = categories.length;

  const point = (i: number, fraction: number) => {
    const angle = (-90 + (i * 360) / n) * (Math.PI / 180);
    const r = Math.max(0, Math.min(1, fraction)) * radius;
    return `${(center + r * Math.cos(angle)).toFixed(1)},${(center + r * Math.sin(angle)).toFixed(1)}`;
  };

  const ring = (fraction: number) =>
    categories.map((_, i) => point(i, fraction)).join(" ");
  const data = categories.map((c, i) => point(i, c.score / 100)).join(" ");
  const summary = categories.map((c) => `${c.label} ${c.score}`).join(", ");

  return (
    <figure className="mt-8">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="mx-auto w-full max-w-72"
        role="img"
        aria-label={`Radar chart of category scores: ${summary}`}
      >
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <polygon
            key={f}
            points={ring(f)}
            fill="none"
            stroke="var(--color-line-strong)"
            strokeWidth="1"
          />
        ))}
        {categories.map((c, i) => (
          <line
            key={c.label}
            x1={center}
            y1={center}
            x2={point(i, 1).split(",")[0]}
            y2={point(i, 1).split(",")[1]}
            stroke="var(--color-line)"
            strokeWidth="1"
          />
        ))}
        <polygon
          points={data}
          fill="var(--color-accent-glow)"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {categories.map((c, i) => {
          const [x, y] = point(i, 1.32).split(",").map(Number);
          return (
            <text
              key={c.label}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--color-muted)"
              fontSize="10"
              fontFamily="var(--font-mono)"
            >
              {c.label} {c.score}
            </text>
          );
        })}
      </svg>
      <figcaption className="mono-label mt-2 text-center uppercase text-faint">
        Category profile — bars below give exact scores
      </figcaption>
    </figure>
  );
}
