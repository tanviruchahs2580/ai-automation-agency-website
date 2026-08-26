"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  budgetRanges,
  companySizes,
  recommendedNextStep,
  timelines,
  type ProjectBrief,
} from "@/lib/validation";
import { contact } from "@/data/site";
import { AnalyticsEvent, track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * Multi-step intake wizard. Client validation mirrors the server Zod schema
 * for UX only — the API re-validates everything and never trusts this form.
 */

interface FormState {
  companyName: string;
  companySize: string;
  industry: string;
  country: string;
  problem: string;
  currentWorkflow: string;
  existingSoftware: string;
  desiredOutcome: string;
  budgetRange: string;
  timeline: string;
  contactName: string;
  contactEmail: string;
  contactRole: string;
  consent: boolean;
  companyWebsite: string; // honeypot
}

const initialForm: FormState = {
  companyName: "",
  companySize: "",
  industry: "",
  country: "",
  problem: "",
  currentWorkflow: "",
  existingSoftware: "",
  desiredOutcome: "",
  budgetRange: "",
  timeline: "",
  contactName: "",
  contactEmail: "",
  contactRole: "",
  consent: false,
  companyWebsite: "",
};

const steps = [
  { title: "Business", fields: ["companyName", "companySize", "industry", "country"] },
  { title: "Problem", fields: ["problem"] },
  { title: "Current Workflow", fields: ["currentWorkflow"] },
  { title: "Existing Software", fields: ["existingSoftware"] },
  { title: "Desired Outcome", fields: ["desiredOutcome"] },
  { title: "Budget Range", fields: ["budgetRange"] },
  { title: "Timeline & Contact", fields: ["timeline", "contactName", "contactEmail", "contactRole", "consent"] },
] as const;

/**
 * Draft persistence — the wizard restores an in-progress submission after an
 * accidental refresh or navigation. Consent is intentionally never restored
 * (must be re-affirmed) and the honeypot field is never persisted.
 */
const DRAFT_STORAGE_KEY = "vantiq:intake-draft:v1";

type Status = "idle" | "submitting" | "error" | "success";

export function ProjectIntake() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [draftRestored, setDraftRestored] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");
  const [result, setResult] = useState<{
    briefId: string;
    nextStep: string;
  } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Signals to tests/automation that controlled inputs are live so typed
  // values cannot race ahead of hydration on slow engines.
  useEffect(() => {
    rootRef.current?.setAttribute("data-hydrated", "true");
  }, []);

  // Hydrate the draft after mount so SSR markup and client markup agree.
  // Deferred one frame: avoids synchronous setState-in-effect cascades while
  // still landing before first paint.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as Partial<FormState>;
        const merged: FormState = {
          ...initialForm,
          ...parsed,
          consent: false,
          companyWebsite: "",
        };
        const hasContent = Object.entries(merged).some(
          ([key, value]) =>
            key !== "consent" && typeof value === "string" && value.length > 0,
        );
        if (!hasContent) return;
        setForm(merged);
        setDraftRestored(true);
      } catch {
        /* corrupted or unavailable draft is ignored */
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({ ...form, companyWebsite: "" }),
      );
    } catch {
      /* storage unavailable — wizard still works without persistence */
    }
  }, [form]);

  const clearDraft = () => {
    try {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const started =
    Object.values(form).some((v) => typeof v === "string" && v.length > 0) ||
    form.consent;

  const onFirstInput = () => {
    if (started) return;
    track(AnalyticsEvent.IntakeStart);
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    onFirstInput();
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validateStep = (): boolean => {
    const next: Record<string, string> = {};
    const current = steps[step];

    for (const field of current.fields as readonly string[]) {
      const value = form[field as keyof FormState];
      switch (field) {
        case "companyName":
          if ((value as string).trim().length < 2)
            next[field] = "Company name is required.";
          break;
        case "industry":
        case "country":
        case "contactName":
        case "contactRole":
          if ((value as string).trim().length < 2)
            next[field] = "This field is required.";
          break;
        case "companySize":
        case "budgetRange":
        case "timeline":
          if (!value) next[field] = "Please choose an option.";
          break;
        case "problem":
          if ((value as string).trim().length < 30)
            next[field] =
              "Please describe the problem in at least 30 characters — context improves our first response.";
          break;
        case "currentWorkflow":
          if ((value as string).trim().length < 10)
            next[field] =
              "A short description is enough (min. 10 characters).";
          break;
        case "desiredOutcome":
          if ((value as string).trim().length < 20)
            next[field] =
              "Describe what success looks like (min. 20 characters).";
          break;
        case "contactEmail":
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value as string))
            next[field] = "Enter a valid work email address.";
          break;
        case "consent":
          if (!(value as boolean))
            next[field] = "We need your consent to process this brief.";
          break;
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (!validateStep()) return;
    if (step === steps.length - 1) {
      void submit();
    } else {
      setStep(step + 1);
    }
  };

  async function submit() {
    setStatus("submitting");
    setServerError("");
    try {
      // Honeypot: pretend success for bots without contacting the API path meaningfully
      if (form.companyWebsite.length > 0) {
        setStatus("success");
        setResult({ briefId: "HB-000000", nextStep: "Thank you." });
        return;
      }

      const payload: Record<string, unknown> = { ...form };
      delete payload.companyWebsite;

      const response = await fetch("/api/project-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Submission failed");
      }

      clearDraft();
      setStatus("success");
      track(AnalyticsEvent.IntakeComplete);
      setResult({
        briefId: data.briefId,
        nextStep:
          data.nextStep ?? recommendedNextStep(form as unknown as ProjectBrief),
      });
    } catch (error) {
      setStatus("error");
      setServerError(
        error instanceof Error && error.message !== "Submission failed"
          ? error.message
          : "Something went wrong submitting your brief. Please try again — or email us directly.",
      );
    }
  }

  if (status === "success" && result) {
    return (
      <div className="card-surface mx-auto max-w-2xl p-8 md:p-10 text-center" aria-live="polite">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-ok/50 bg-ok/10 text-xl text-ok">
          ✓
        </span>
        <h2 className="mt-5 text-2xl font-bold tracking-tight">
          Your project brief is ready.
        </h2>
        <p className="mono-label mt-3 text-muted">Reference: {result.briefId}</p>

        <div className="mt-7 rounded-lg border border-line bg-surface2 p-5 text-left">
          <p className="mono-label uppercase text-faint">Summary</p>
          <dl className="mt-3 space-y-2 text-sm">
            <SummaryRow label="Company" value={`${form.companyName} · ${form.companySize}`} />
            <SummaryRow label="Industry" value={form.industry} />
            <SummaryRow label="Objective" value={form.desiredOutcome} />
            <SummaryRow label="Budget" value={form.budgetRange} />
            <SummaryRow label="Timeline" value={form.timeline} />
          </dl>
          <p className="mono-label mt-5 uppercase text-accent-strong">
            Recommended next step
          </p>
          <p className="mt-1 text-sm">{result.nextStep}</p>
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href={contact.meetingLink}
            onClick={() => track(AnalyticsEvent.MeetingClick)}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-strong"
          >
            Book a Discovery Call
          </a>
          <span className="text-xs leading-relaxed self-center text-faint">
            Save reference {result.briefId} — quoting it lets any follow-up
            email or call pick up exactly where you left off.
          </span>
        </div>
      </div>
    );
  }

  const current = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div
      ref={rootRef}
      data-testid="intake-wizard"
      className="card-surface mx-auto max-w-2xl p-6 md:p-10"
    >
      {/* Step indicator */}
      <ol className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Form steps">
        {steps.map((s, i) => (
          <li key={s.title} aria-current={i === step ? "step" : undefined}>
            <span
              className={cn(
                "mono-label uppercase",
                i === step ? "text-accent-strong" : i < step ? "text-muted" : "text-faint",
              )}
            >
              {i + 1}. {s.title}
            </span>
          </li>
        ))}
      </ol>
      <div
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Overall progress"
        className="mt-4 h-1 overflow-hidden rounded-full bg-surface2"
      >
        <div
          className="h-full rounded-full bg-accent transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      {draftRestored && (
        <p className="mono-label mt-3 text-ok">
          Draft restored — pick up where you left off.
        </p>
      )}

      <div className="mt-8 space-y-5">
        <h2 className="text-xl font-bold tracking-tight">{current.title}</h2>

        {(current.fields as readonly string[]).includes("companyName") && (
          <>
            <Field label="Company name" htmlFor="f-companyName" error={errors.companyName}>
              <input
                type="text"
                id="f-companyName"
                autoComplete="organization"
                value={form.companyName}
                onChange={(e) => set("companyName", e.target.value)}
                className={inputClass(!!errors.companyName)}
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-3">
              <SelectField
                id="f-companySize"
                label="Company size"
                options={[...companySizes]}
                value={form.companySize}
                error={errors.companySize}
                onChange={(v) => set("companySize", v)}
              />
              <Field label="Industry" htmlFor="f-industry" error={errors.industry}>
                <input
                  type="text"
                  id="f-industry"
                  value={form.industry}
                  onChange={(e) => set("industry", e.target.value)}
                  className={inputClass(!!errors.industry)}
                />
              </Field>
              <Field label="Country" htmlFor="f-country" error={errors.country}>
                <input
                  type="text"
                  id="f-country"
                  autoComplete="country-name"
                  value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                  className={inputClass(!!errors.country)}
                />
              </Field>
            </div>
          </>
        )}

        {(current.fields as readonly string[]).includes("problem") && (
          <Field
            htmlFor="f-problem"
            label="What problem are you trying to solve?"
            hint="The more concrete, the better our first response."
            error={errors.problem}
          >
            <textarea
              id="f-problem"
              rows={5}
              value={form.problem}
              onChange={(e) => set("problem", e.target.value)}
              className={cn(inputClass(!!errors.problem), "resize-y")}
            />
          </Field>
        )}

        {(current.fields as readonly string[]).includes("currentWorkflow") && (
          <Field
            htmlFor="f-currentWorkflow"
            label="How does this work get done today?"
            error={errors.currentWorkflow}
          >
            <textarea
              id="f-currentWorkflow"
              rows={4}
              value={form.currentWorkflow}
              onChange={(e) => set("currentWorkflow", e.target.value)}
              className={cn(inputClass(!!errors.currentWorkflow), "resize-y")}
            />
          </Field>
        )}

        {(current.fields as readonly string[]).includes("existingSoftware") && (
          <Field
            htmlFor="f-existingSoftware"
            label="Which systems are involved?"
            hint="ERP, CRM, ticketing, spreadsheets — comma separated. Optional."
            error={errors.existingSoftware}
          >
            <input
              type="text"
              id="f-existingSoftware"
              value={form.existingSoftware}
              onChange={(e) => set("existingSoftware", e.target.value)}
              className={inputClass(false)}
            />
          </Field>
        )}

        {(current.fields as readonly string[]).includes("desiredOutcome") && (
          <Field
            htmlFor="f-desiredOutcome"
            label="What does success look like?"
            error={errors.desiredOutcome}
          >
            <textarea
              id="f-desiredOutcome"
              rows={4}
              value={form.desiredOutcome}
              onChange={(e) => set("desiredOutcome", e.target.value)}
              className={cn(inputClass(!!errors.desiredOutcome), "resize-y")}
            />
          </Field>
        )}

        {(current.fields as readonly string[]).includes("budgetRange") && (
          <SelectField
            id="f-budgetRange"
            label="Indicative budget range"
            options={[...budgetRanges]}
            value={form.budgetRange}
            error={errors.budgetRange}
            onChange={(v) => set("budgetRange", v)}
          />
        )}

        {(current.fields as readonly string[]).includes("timeline") && (
          <>
            <SelectField
              id="f-timeline"
              label="Expected timeline"
              options={[...timelines]}
              value={form.timeline}
              error={errors.timeline}
              onChange={(v) => set("timeline", v)}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Your name" htmlFor="f-contactName" error={errors.contactName}>
                <input
                  type="text"
                  id="f-contactName"
                  autoComplete="name"
                  value={form.contactName}
                  onChange={(e) => set("contactName", e.target.value)}
                  className={inputClass(!!errors.contactName)}
                />
              </Field>
              <Field label="Role" htmlFor="f-contactRole" error={errors.contactRole}>
                <input
                  type="text"
                  id="f-contactRole"
                  value={form.contactRole}
                  onChange={(e) => set("contactRole", e.target.value)}
                  className={inputClass(!!errors.contactRole)}
                />
              </Field>
            </div>
            <Field label="Work email" htmlFor="f-contactEmail" error={errors.contactEmail}>
              <input
                type="email"
                id="f-contactEmail"
                autoComplete="email"
                value={form.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)}
                className={inputClass(!!errors.contactEmail)}
              />
            </Field>

            {/* Honeypot — hidden from humans */}
            <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
              <label htmlFor="f-companyWebsite">Company website</label>
              <input
                type="text"
                id="f-companyWebsite"
                tabIndex={-1}
                autoComplete="off"
                value={form.companyWebsite}
                onChange={(e) => set("companyWebsite", e.target.value)}
              />
            </div>

            <div>
              <label className="flex items-start gap-3 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={(e) => set("consent", e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[color:var(--color-accent)]"
                />
                <span>
                  I agree that VANTIQ SYSTEMS may process this brief to respond
                  to my enquiry, as described in the{" "}
                  <Link href="/privacy" className="underline underline-offset-2">
                    privacy policy
                  </Link>
                  .
                </span>
              </label>
              {errors.consent && (
                <p role="alert" className="mt-1 text-xs text-warn">{errors.consent}</p>
              )}
            </div>
          </>
        )}
      </div>

      {status === "error" && (
        <p role="alert" className="mt-6 rounded border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn">
          {serverError}
        </p>
      )}

      <div className="mt-9 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0 || status === "submitting"}
          className="mono-label uppercase text-muted transition-colors hover:text-ink disabled:opacity-40"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={status === "submitting"}
          className="inline-flex min-h-11 items-center rounded-md bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          {status === "submitting"
            ? "Submitting…"
            : step === steps.length - 1
              ? "Submit Project Brief"
              : "Continue →"}
        </button>
      </div>
    </div>
  );
}

function inputClass(hasError: boolean): string {
  return cn(
    "w-full rounded-md border bg-surface2 px-3 py-2.5 text-sm focus:border-accent focus:outline-none",
    hasError ? "border-warn" : "border-line",
  );
}

function Field({
  label,
  htmlFor,
  children,
  error,
  hint,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium">{label}</label>
      {hint && <p className="mt-1 text-xs text-faint">{hint}</p>}
      <div className="mt-1.5">{children}</div>
      {error && (
        <p role="alert" className="mt-1 text-xs text-warn">
          {error}
        </p>
      )}
    </div>
  );
}

function SelectField({
  id,
  label,
  options,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <Field label={label} error={error} htmlFor={id}>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputClass(!!error), "appearance-none pr-9")}
        >
          <option value="">Select…</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 12 8"
          fill="none"
          className="pointer-events-none absolute right-3 top-1/2 h-2 w-3 -translate-y-1/2 text-faint"
        >
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Field>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-line pb-2 last:border-0">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium">{value || "—"}</dd>
    </div>
  );
}
