"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  budgetRanges,
  companySizes,
  recommendedNextStep,
  timelines,
} from "@/lib/validation";
import { contact } from "@/data/site";
import { AnalyticsEvent, track } from "@/lib/analytics";
import { Icon } from "@/components/ui/Icon";
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
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  const [result, setResult] = useState<{
    briefId: string;
    nextStep: string;
  } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  // Set as soon as the user edits the form; invalidates the deferred draft
  // restore below so it can never overwrite live input or flash a bogus banner.
  const editedBeforeRestoreRef = useRef(false);
  const reduceMotion = useReducedMotion();

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
      if (editedBeforeRestoreRef.current) return;
      try {
        const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as Partial<FormState> & {
          savedAt?: unknown;
        };
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
        if (typeof parsed.savedAt === "number") setDraftSavedAt(parsed.savedAt);
      } catch {
        /* corrupted or unavailable draft is ignored */
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    // `initialForm` by reference means this is the mount run (or startFresh,
    // which already cleared the draft) — nothing to persist yet. Any other
    // change is live user input, which must beat the deferred restore above.
    if (form === initialForm) return;
    editedBeforeRestoreRef.current = true;
    try {
      window.localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({ ...form, companyWebsite: "", savedAt: Date.now() }),
      );
    } catch {
      /* storage unavailable — wizard still works without persistence */
    }
  }, [form]);

  // Move focus to the receipt heading once the wizard resolves. The success
  // view replaces the whole subtree, so without this the submit button that
  // had focus is unmounted and the caret lands on <body>.
  useEffect(() => {
    if (status === "success") successHeadingRef.current?.focus();
  }, [status]);

  const startFresh = () => {
    clearDraft();
    setForm(initialForm);
    setErrors({});
    setStep(0);
    setDraftRestored(false);
  };

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
      /*
        The response is parsed defensively rather than trusted. `response.json()`
        is `any`, and an error page or proxy returning HTML would otherwise make
        `data.ok` a runtime TypeError; reading the fields through a shape check
        keeps the receipt honest about what the server actually sent.
      */
      const data = parseBriefResponse(await response.json().catch(() => null));
      const briefId = data.briefId;

      if (!response.ok || !data.ok || !briefId) {
        throw new Error(data.error ?? "Submission failed");
      }

      clearDraft();
      setStatus("success");
      track(AnalyticsEvent.IntakeComplete);
      setResult({
        briefId,
        nextStep:
          data.nextStep ??
          recommendedNextStep({
            problem: form.problem,
            desiredOutcome: form.desiredOutcome,
          }),
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
    const briefText = [
      `VANTIQ SYSTEMS — project brief ${result.briefId}`,
      ``,
      `Company: ${form.companyName} (${form.companySize}, ${form.industry}, ${form.country})`,
      `Contact: ${form.contactName}, ${form.contactRole}, ${form.contactEmail}`,
      `Problem: ${form.problem}`,
      `Current workflow: ${form.currentWorkflow}`,
      `Systems: ${form.existingSoftware || "—"}`,
      `Desired outcome: ${form.desiredOutcome}`,
      `Budget: ${form.budgetRange} · Timeline: ${form.timeline}`,
      ``,
      `Recommended next step: ${result.nextStep}`,
    ].join("\n");
    const downloadBrief = () => {
      const blob = new Blob([briefText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `vantiq-brief-${result.briefId}.txt`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    };
    return (
      <div className="card-surface mx-auto max-w-2xl p-8 text-center md:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-signal/50 bg-signal/10 text-2xl text-signal" aria-hidden="true">
          ✓
        </span>
        <h2
          ref={successHeadingRef}
          tabIndex={-1}
          className="mt-5 text-2xl font-bold tracking-tight"
        >
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

        {/*
          Every action here has to work when it is rendered. [Book a Call]
          previously pointed at a "#meeting-link-placeholder" anchor, so the
          single highest-intent control on the site silently did nothing; it now
          appears only when NEXT_PUBLIC_MEETING_LINK is configured. Download and
          Share always work — they are generated in the browser.
        */}
        <div
          className={cn(
            "mt-7 grid gap-3",
            contact.meetingLink ? "sm:grid-cols-3" : "sm:grid-cols-2",
          )}
        >
          {contact.meetingLink && (
            <a
              href={contact.meetingLink}
              target="_blank"
              rel="noreferrer noopener"
              onClick={() => track(AnalyticsEvent.MeetingClick)}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-strong"
            >
              Book a Call
            </a>
          )}
          <button
            type="button"
            onClick={downloadBrief}
            className="btn-quiet btn"
          >
            Download Brief
          </button>
          <a
            href={`mailto:?subject=${encodeURIComponent(`Project brief ${result.briefId}`)}&body=${encodeURIComponent(`${briefText}\n\nQuoting reference ${result.briefId} lets any follow-up pick up where we left off.`)}`}
            className="btn-quiet btn"
          >
            Share With Team
          </a>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-faint">
          Save reference {result.briefId} — quoting it lets any follow-up
          email or call pick up exactly where you left off.
        </p>
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
      <div className="flex items-baseline justify-between gap-4">
        <p className="mono-label tabular text-faint" aria-hidden="true">
          {String(step + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
        </p>
        <p className="mono-label uppercase text-faint">{current.title}</p>
      </div>
      <ol className="mt-2 flex flex-wrap gap-x-4 gap-y-1" aria-label="Form steps">
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
        <div
          role="status"
          className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-line bg-surface2 px-4 py-3"
        >
          <p className="mono-label flex-1 text-muted">
            Restored draft
            {draftSavedAt
              ? ` from ${new Date(draftSavedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
              : ""}
          </p>
          <button
            type="button"
            onClick={() => setDraftRestored(false)}
            className="mono-label uppercase text-accent-strong hover:underline"
          >
            Keep editing
          </button>
          <button
            type="button"
            onClick={startFresh}
            className="mono-label uppercase text-faint hover:text-ink hover:underline"
          >
            Start fresh
          </button>
        </div>
      )}

      <motion.div
        key={step}
        initial={reduceMotion ? false : { opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
        aria-live="polite"
        className="mt-8 space-y-5"
      >
        <h2 className="text-xl font-bold tracking-tight">{current.title}</h2>

        {(current.fields as readonly string[]).includes("companyName") && (
          <>
            <Field label="Company name" htmlFor="f-companyName" error={errors.companyName}>
              {(aria) => (
                <input
                  type="text"
                  id="f-companyName"
                  autoComplete="organization"
                  value={form.companyName}
                  onChange={(e) => set("companyName", e.target.value)}
                  {...aria}
                  className={inputClass(!!errors.companyName)}
                />
              )}
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
                {(aria) => (
                  <input
                    type="text"
                    id="f-industry"
                    value={form.industry}
                    onChange={(e) => set("industry", e.target.value)}
                    {...aria}
                    className={inputClass(!!errors.industry)}
                  />
                )}
              </Field>
              <Field label="Country" htmlFor="f-country" error={errors.country}>
                {(aria) => (
                  <input
                    type="text"
                    id="f-country"
                    autoComplete="country-name"
                    value={form.country}
                    onChange={(e) => set("country", e.target.value)}
                    {...aria}
                    className={inputClass(!!errors.country)}
                  />
                )}
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
            {(aria) => (
              <textarea
                id="f-problem"
                rows={5}
                value={form.problem}
                onChange={(e) => set("problem", e.target.value)}
                {...aria}
                className={cn(inputClass(!!errors.problem), "resize-y")}
              />
            )}
          </Field>
        )}

        {(current.fields as readonly string[]).includes("currentWorkflow") && (
          <Field
            htmlFor="f-currentWorkflow"
            label="How does this work get done today?"
            error={errors.currentWorkflow}
          >
            {(aria) => (
              <textarea
                id="f-currentWorkflow"
                rows={4}
                value={form.currentWorkflow}
                onChange={(e) => set("currentWorkflow", e.target.value)}
                {...aria}
                className={cn(inputClass(!!errors.currentWorkflow), "resize-y")}
              />
            )}
          </Field>
        )}

        {(current.fields as readonly string[]).includes("existingSoftware") && (
          <Field
            htmlFor="f-existingSoftware"
            label="Which systems are involved?"
            hint="ERP, CRM, ticketing, spreadsheets — comma separated. Optional."
            error={errors.existingSoftware}
            required={false}
          >
            {(aria) => (
              <input
                type="text"
                id="f-existingSoftware"
                value={form.existingSoftware}
                onChange={(e) => set("existingSoftware", e.target.value)}
                {...aria}
                className={inputClass(false)}
              />
            )}
          </Field>
        )}

        {(current.fields as readonly string[]).includes("desiredOutcome") && (
          <Field
            htmlFor="f-desiredOutcome"
            label="What does success look like?"
            error={errors.desiredOutcome}
          >
            {(aria) => (
              <textarea
                id="f-desiredOutcome"
                rows={4}
                value={form.desiredOutcome}
                onChange={(e) => set("desiredOutcome", e.target.value)}
                {...aria}
                className={cn(inputClass(!!errors.desiredOutcome), "resize-y")}
              />
            )}
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
                {(aria) => (
                  <input
                    type="text"
                    id="f-contactName"
                    autoComplete="name"
                    value={form.contactName}
                    onChange={(e) => set("contactName", e.target.value)}
                    {...aria}
                    className={inputClass(!!errors.contactName)}
                  />
                )}
              </Field>
              <Field label="Role" htmlFor="f-contactRole" error={errors.contactRole}>
                {(aria) => (
                  <input
                    type="text"
                    id="f-contactRole"
                    value={form.contactRole}
                    onChange={(e) => set("contactRole", e.target.value)}
                    {...aria}
                    className={inputClass(!!errors.contactRole)}
                  />
                )}
              </Field>
            </div>
            <Field label="Work email" htmlFor="f-contactEmail" error={errors.contactEmail}>
              {(aria) => (
                <input
                  type="email"
                  id="f-contactEmail"
                  autoComplete="email"
                  value={form.contactEmail}
                  onChange={(e) => set("contactEmail", e.target.value)}
                  {...aria}
                  className={inputClass(!!errors.contactEmail)}
                />
              )}
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
                  aria-invalid={errors.consent ? true : undefined}
                  aria-describedby={errors.consent ? "f-consent-error" : undefined}
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
                <p id="f-consent-error" role="alert" className="mt-1 text-xs text-critical">{errors.consent}</p>
              )}
            </div>
          </>
        )}
      </motion.div>

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

/**
 * Shape-checked read of the intake API response. `response.json()` is `any`,
 * so every field is narrowed before use instead of being trusted.
 */
function parseBriefResponse(value: unknown): {
  ok: boolean;
  error?: string;
  briefId?: string;
  nextStep?: string;
} {
  if (typeof value !== "object" || value === null) return { ok: false };
  const record = value as Record<string, unknown>;
  return {
    ok: record.ok === true,
    error: typeof record.error === "string" ? record.error : undefined,
    briefId: typeof record.briefId === "string" ? record.briefId : undefined,
    nextStep: typeof record.nextStep === "string" ? record.nextStep : undefined,
  };
}

function inputClass(hasError: boolean): string {
  return cn(
    /*
      No `focus:outline-none` here. The global `:focus-visible` rule in
      globals.css draws a 2px accent outline, and a Tailwind utility would
      outrank it, leaving only a 1px border-color shift as the focus
      indicator. Keeping the outline restores a clearly visible focus state on
      every input, textarea and select.
    */
    "min-h-11 w-full rounded-md border bg-surface2 px-3 py-2.5 text-sm transition-colors duration-150 focus:border-accent",
    hasError ? "border-critical" : "border-line",
  );
}

/** Aria wiring the control itself needs, supplied by `Field`. */
interface FieldAria {
  "aria-describedby": string | undefined;
  "aria-invalid": true | undefined;
  "aria-required": true | undefined;
}

/**
 * Labelled form row.
 *
 * `children` is a render function rather than a node so the error/hint wiring
 * can reach the control itself. Previously the message was announced once on
 * submit (`role="alert"`) but the field carried no `aria-invalid`, no
 * `aria-describedby` and no `aria-required`, so a screen-reader user reviewing
 * the form — or returning after a server error — could not tell which field was
 * wrong or what was required.
 */
function Field({
  label,
  htmlFor,
  children,
  error,
  hint,
  required = true,
}: {
  label: string;
  htmlFor: string;
  children: (aria: FieldAria) => React.ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
}) {
  const hintId = `${htmlFor}-hint`;
  const errorId = `${htmlFor}-error`;
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium">{label}</label>
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-faint">
          {hint}
        </p>
      )}
      <div className="mt-1.5">
        {children({
          "aria-describedby": describedBy,
          "aria-invalid": error ? true : undefined,
          "aria-required": required ? true : undefined,
        })}
      </div>
      {error && (
        <p id={errorId} key={error} role="alert" className="field-shake mt-1 text-xs text-critical">
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
      {(aria) => (
        <div className="relative">
          <select
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            {...aria}
            className={cn(inputClass(!!error), "appearance-none pr-9")}
          >
            <option value="">Select…</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <Icon
            name="chevron-down"
            size={12}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-faint"
          />
        </div>
      )}
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
