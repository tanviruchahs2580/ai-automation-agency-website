"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { computeRoi } from "@/lib/roi";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { AnalyticsEvent, track } from "@/lib/analytics";

const defaults = {
  employees: 12,
  averageSalary: 52000,
  hoursPerTask: 0.5,
  tasksPerWeek: 40,
  errorCostPerTask: 2,
  currentSoftwareCostAnnual: 12000,
  automationRatePercent: 60,
  estimatedAnnualInvestment: 48000,
};

const fields = [
  { key: "employees", label: "Employees doing this work", min: 1, max: 50000, step: 1, suffix: "" },
  { key: "averageSalary", label: "Average annual salary", min: 1000, max: 1000000, step: 1000, suffix: "$" },
  { key: "hoursPerTask", label: "Hours per task (manual)", min: 0.05, max: 40, step: 0.05, suffix: "h" },
  { key: "tasksPerWeek", label: "Tasks per employee / week", min: 1, max: 2000, step: 1, suffix: "" },
  { key: "errorCostPerTask", label: "Error / rework cost per task", min: 0, max: 10000, step: 1, suffix: "$" },
  { key: "currentSoftwareCostAnnual", label: "Current software cost (annual)", min: 0, max: 5000000, step: 500, suffix: "$" },
  { key: "automationRatePercent", label: "Estimated automation potential", min: 0, max: 95, step: 5, suffix: "%" },
  { key: "estimatedAnnualInvestment", label: "Expected solution investment / yr", min: 0, max: 5000000, step: 1000, suffix: "$" },
] as const;

export function ROICalculator() {
  const [inputs, setInputs] = useState(defaults);
  const [touched, setTouched] = useState(false);

  const results = useMemo(() => computeRoi(inputs), [inputs]);

  const update = (key: keyof typeof defaults) => (raw: string) => {
    if (!touched) {
      setTouched(true);
      track(AnalyticsEvent.CalculatorUse);
    }
    const value = Number(raw);
    setInputs((prev) => ({
      ...prev,
      [key]: Number.isFinite(value) ? value : prev[key],
    }));
  };

  // Free typing while editing; out-of-range values snap to the field's
  // documented min/max when the user leaves the input.
  const clampOnBlur = (key: keyof typeof defaults, raw: number) => {
    const field = fields.find((f) => f.key === key);
    if (!field || !Number.isFinite(raw)) return;
    const clamped = Math.min(Math.max(raw, field.min), field.max);
    setInputs((prev) =>
      prev[key] === clamped ? prev : { ...prev, [key]: clamped },
    );
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <form className="card-surface p-6 md:p-8 lg:col-span-6" onSubmit={(e) => e.preventDefault()}>
        <p className="mono-label uppercase text-faint">Your assumptions</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.key}>
              <label
                htmlFor={`roi-${field.key}`}
                className="block text-xs font-medium leading-snug"
              >
                {field.label}
              </label>
              <div className="relative mt-1.5">
                {field.suffix === "$" && (
                  <span aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-faint">$</span>
                )}
                <input
                  id={`roi-${field.key}`}
                  type="number"
                  inputMode="decimal"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={inputs[field.key]}
                  onChange={(e) => update(field.key)(e.target.value)}
                  onBlur={(e) => clampOnBlur(field.key, Number(e.target.value))}
                  className="w-full rounded-md border border-line bg-surface2 px-3 py-2 font-mono text-sm tabular-nums focus:border-accent focus:outline-none"
                />
                {(field.suffix === "%" || field.suffix === "h") && (
                  <span aria-hidden="true" className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-faint">
                    {field.suffix}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 border-t border-line pt-4 text-[11px] leading-relaxed text-faint">
          This calculator provides an indicative estimate based entirely on your
          inputs. It is not a financial guarantee. Assumptions: 48 working weeks,
          salary converted to an hourly cost over 2,080 hours.
        </p>
      </form>

      <div className="lg:col-span-6" aria-live="polite">
        <div className="card-surface h-full p-6 md:p-8">
          <p className="mono-label uppercase text-faint">Estimated outcome</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Metric
              label="Annual manual cost"
              value={formatCurrency(results.annualManualCost)}
            />
            <Metric
              label="Automatable share"
              value={formatCurrency(results.automatableCostAnnual)}
            />
            <Metric
              label="Est. annual savings"
              value={formatCurrency(Math.max(0, results.estimatedAnnualSavings))}
              highlight={results.estimatedAnnualSavings > 0}
            />
            <Metric
              label="Est. ROI"
              value={
                results.estimatedRoiPercent === null
                  ? "—"
                  : `${Math.round(results.estimatedRoiPercent)}%`
              }
              highlight={(results.estimatedRoiPercent ?? 0) > 0}
            />
            <Metric
              label="Payback period"
              value={
                results.paybackMonths === null
                  ? "—"
                  : `${results.paybackMonths.toFixed(1)} months`
              }
            />
            <Metric
              label="Weekly hours released"
              value={`${formatNumber(results.weeklyHours)} h`}
            />
          </div>

          <dl className="mt-6 space-y-2 border-t border-line pt-5 text-xs text-muted">
            <div className="flex justify-between">
              <dt>Tasks processed weekly</dt>
              <dd className="font-mono tabular-nums">{formatNumber(results.weeklyTasks)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Implied hourly labour cost</dt>
              <dd className="font-mono tabular-nums">${results.hourlyCost.toFixed(2)}</dd>
            </div>
          </dl>

          <p className="mt-6 rounded border border-warn/30 bg-warn/5 px-4 py-3 text-xs leading-relaxed text-warn/90">
            Estimated values only. Results depend entirely on your assumptions
            above and are not a commitment of savings, ROI or payback.
          </p>

          <Link
            href="/start-a-project"
            onClick={() =>
              track(AnalyticsEvent.CtaClick, { location: "roi-calculator" })
            }
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-strong sm:w-auto"
          >
            Validate These Numbers With An Engineer
          </Link>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-md border p-4 transition-colors duration-300 ${
        highlight ? "border-ok/40 bg-ok/5" : "border-line bg-surface2"
      }`}
    >
      <p className="mono-label text-faint">{label}</p>
      <p className="mt-1 font-mono text-xl tabular-nums">{value}</p>
    </div>
  );
}
