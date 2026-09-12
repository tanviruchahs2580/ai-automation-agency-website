"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { computeRoi } from "@/lib/roi";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { AnalyticsEvent, track } from "@/lib/analytics";
import { MetricsPulse } from "@/components/scenes/MetricsPulse";

/**
 * ROI calculator with progressive disclosure (§14):
 * 3 inputs first (industry / headcount / manual hours per week) → a
 * preliminary estimate on conservative assumptions → "Refine this estimate"
 * reveals the remaining 7 inputs and tightens the range.
 */

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

/** Conservative automation presets per industry — documented, not folklore. */
const industryPresets = [
  { value: "financial-services", label: "Financial services", automationRate: 55 },
  { value: "healthcare", label: "Healthcare", automationRate: 45 },
  { value: "manufacturing", label: "Manufacturing", automationRate: 60 },
  { value: "retail", label: "Retail", automationRate: 55 },
  { value: "logistics", label: "Logistics", automationRate: 60 },
  { value: "saas-technology", label: "SaaS & technology", automationRate: 60 },
] as const;

const refinedFields = [
  { key: "averageSalary", label: "Average annual salary", min: 1000, max: 1000000, step: 1000, suffix: "$" },
  { key: "hoursPerTask", label: "Hours per task (manual)", min: 0.05, max: 40, step: 0.05, suffix: "h" },
  { key: "tasksPerWeek", label: "Tasks per employee / week", min: 1, max: 2000, step: 1, suffix: "" },
  { key: "errorCostPerTask", label: "Error / rework cost per task", min: 0, max: 10000, step: 1, suffix: "$" },
  { key: "currentSoftwareCostAnnual", label: "Current software cost (annual)", min: 0, max: 5000000, step: 500, suffix: "$" },
  { key: "automationRatePercent", label: "Estimated automation potential", min: 0, max: 95, step: 5, suffix: "%" },
  { key: "estimatedAnnualInvestment", label: "Expected solution investment / yr", min: 0, max: 5000000, step: 1000, suffix: "$" },
] as const;

type NumericKey = keyof typeof defaults;

export function ROICalculator() {
  const [inputs, setInputs] = useState(defaults);
  const [industry, setIndustry] = useState<string>(industryPresets[5].value);
  const [weeklyHours, setWeeklyHours] = useState(20);
  const [refined, setRefined] = useState(false);
  const [touched, setTouched] = useState(false);
  const params = useSearchParams();
  const prefilled = useRef(false);

  // ?industry=<slug> pre-fill (e.g. from an industry page): applied once
  // after mount so SSR markup and the first client paint agree. Unknown
  // slugs fall back to the default preset — never an error state.
  useEffect(() => {
    if (prefilled.current) return;
    prefilled.current = true;
    const raf = requestAnimationFrame(() => {
      const slug = params.get("industry");
      if (!slug) return;
      const preset = industryPresets.find((p) => p.value === slug);
      if (!preset) return;
      setIndustry(preset.value);
      setInputs((prev) => ({ ...prev, automationRatePercent: preset.automationRate }));
    });
    return () => cancelAnimationFrame(raf);
  }, [params]);

  const results = useMemo(() => computeRoi(inputs), [inputs]);

  const markUsed = () => {
    if (!touched) {
      setTouched(true);
      track(AnalyticsEvent.CalculatorUse);
    }
  };

  const update = (key: NumericKey) => (raw: string) => {
    markUsed();
    const value = Number(raw);
    setInputs((prev) => ({
      ...prev,
      [key]: Number.isFinite(value) ? value : prev[key],
    }));
  };

  // Free typing while editing; out-of-range values snap to the field's
  // documented min/max when the user leaves the input.
  const clampOnBlur = (key: NumericKey, raw: number, min: number, max: number) => {
    if (!Number.isFinite(raw)) return;
    const clamped = Math.min(Math.max(raw, min), max);
    setInputs((prev) =>
      prev[key] === clamped ? prev : { ...prev, [key]: clamped },
    );
  };

  const onIndustryChange = (value: string) => {
    markUsed();
    setIndustry(value);
    const preset = industryPresets.find((p) => p.value === value);
    if (preset) {
      setInputs((prev) => ({ ...prev, automationRatePercent: preset.automationRate }));
    }
  };

  /** Weekly-hours shortcut: re-expresses as tasks/week at the default 0.5h task. */
  const onWeeklyHours = (raw: string) => {
    markUsed();
    const value = Number(raw);
    if (!Number.isFinite(value)) return;
    const clamped = Math.min(Math.max(value, 1), 80);
    setWeeklyHours(clamped);
    setInputs((prev) => ({
      ...prev,
      tasksPerWeek: Math.min(Math.max(Math.round(clamped / 0.5), 1), 2000),
    }));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <form
        className="card-surface p-6 md:p-8 lg:col-span-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <p className="mono-label uppercase text-faint">
          Step 01 — Your situation
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="roi-industry" className="block text-xs font-medium leading-snug">
              Industry
            </label>
            <select
              id="roi-industry"
              value={industry}
              onChange={(e) => onIndustryChange(e.target.value)}
              className="mt-1.5 min-h-11 w-full rounded-md border border-line bg-surface2 px-3 py-2 text-sm focus:border-accent focus:outline-none"
            >
              {industryPresets.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label} — assumes {preset.automationRate}% automation
                </option>
              ))}
            </select>
          </div>
          <NumberField
            id="roi-employees"
            label="Current headcount on manual ops"
            value={inputs.employees}
            min={1}
            max={50000}
            step={1}
            onChange={update("employees")}
            onBlur={(v) => clampOnBlur("employees", v, 1, 50000)}
          />
          <NumberField
            id="roi-weekly-hours"
            label="Manual hours / person / week"
            value={weeklyHours}
            min={1}
            max={80}
            step={1}
            suffix="h"
            onChange={onWeeklyHours}
            onBlur={(v) => {
              if (Number.isFinite(v)) setWeeklyHours(Math.min(Math.max(v, 1), 80));
            }}
          />
        </div>

        <div className="mt-6 border-t border-line pt-5">
          <button
            type="button"
            aria-expanded={refined}
            aria-controls="roi-refined-fields"
            onClick={() => {
              setRefined((v) => !v);
              markUsed();
            }}
            className="btn-quiet btn w-full sm:w-auto"
          >
            {refined ? "Hide advanced inputs" : "Refine this estimate"}
            <span aria-hidden="true" className="font-mono">
              {refined ? "−" : "+"}
            </span>
          </button>
          <p className="mt-2 text-[11px] leading-relaxed text-faint">
            Preliminary numbers use conservative {inputs.automationRatePercent}%
            automation for {industryPresets.find((p) => p.value === industry)?.label}.
            Refining tightens the range.
          </p>
        </div>

        {refined && (
          <div id="roi-refined-fields" className="mt-5 grid gap-4 sm:grid-cols-2">
            <p className="mono-label uppercase text-faint sm:col-span-2">
              Step 02 — Refine the assumptions
            </p>
            {refinedFields.map((field) => (
              <NumberField
                key={field.key}
                id={`roi-${field.key}`}
                label={field.label}
                value={inputs[field.key]}
                min={field.min}
                max={field.max}
                step={field.step}
                suffix={field.suffix}
                onChange={update(field.key)}
                onBlur={(v) => clampOnBlur(field.key, v, field.min, field.max)}
              />
            ))}
          </div>
        )}

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
            <div className="flex justify-between">
              <dt>Estimate status</dt>
              <dd>
                <MetricsPulse>{refined ? "Refined" : "Preliminary"}</MetricsPulse>
              </dd>
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
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-strong sm:w-auto"
          >
            Validate These Numbers With An Engineer
          </Link>
        </div>
      </div>
    </div>
  );
}

function NumberField({
  id,
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
  onBlur,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (raw: string) => void;
  onBlur: (value: number) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium leading-snug">
        {label}
      </label>
      <div className="relative mt-1.5">
        {suffix === "$" && (
          <span aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-faint">$</span>
        )}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onBlur(Number(e.target.value))}
          className="min-h-11 w-full rounded-md border border-line bg-surface2 px-3 py-2 font-mono text-sm tabular-nums focus:border-accent focus:outline-none"
        />
        {(suffix === "%" || suffix === "h") && (
          <span aria-hidden="true" className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-faint">
            {suffix}
          </span>
        )}
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
