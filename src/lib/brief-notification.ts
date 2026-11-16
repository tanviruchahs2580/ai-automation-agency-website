import { siteConfig } from "@/data/site";
import type { ProjectBrief } from "@/lib/validation";

/**
 * Optional email dispatch for accepted project briefs.
 *
 * Activation is purely configuration: set RESEND_API_KEY and
 * BRIEF_NOTIFICATION_EMAIL (optionally BRIEF_NOTIFICATION_FROM) in the host
 * environment and every accepted brief is emailed to the inbox. Without the
 * vars the endpoint behaves exactly as before — receipt only, nothing sent,
 * nothing logged. Uses plain fetch; no provider SDK dependency.
 *
 * A failed notification never fails the submission: the visitor always gets
 * their reference ID. Failures are surfaced via the returned reason so the
 * server can log them without leaking brief content.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/**
 * How long the provider may take before the request is abandoned.
 *
 * Without a signal, a provider that accepts the connection and then stalls holds
 * the whole serverless invocation open until the platform's own function
 * timeout — the visitor waits for a receipt that only depends on this call
 * *succeeding*, while a hung sibling keeps them on the submitting state. Ten
 * seconds is far above a normal API response and far below a platform cap.
 */
const NOTIFICATION_TIMEOUT_MS = 10_000;

export interface BriefNotificationResult {
  sent: boolean;
  reason?: "not-configured" | "network-error" | `provider-${number}`;
}

interface NotificationEnv extends Record<string, string | undefined> {
  RESEND_API_KEY?: string;
  BRIEF_NOTIFICATION_EMAIL?: string;
  BRIEF_NOTIFICATION_FROM?: string;
}

export function isNotificationConfigured(
  env: NotificationEnv = process.env,
): boolean {
  return Boolean(env.RESEND_API_KEY && env.BRIEF_NOTIFICATION_EMAIL);
}

function buildPlainText(briefId: string, brief: ProjectBrief): string {
  return [
    `New project brief — reference ${briefId}`,
    "",
    `Company: ${brief.companyName} (${brief.companySize})`,
    `Industry: ${brief.industry}`,
    `Country: ${brief.country}`,
    `Contact: ${brief.contactName} <${brief.contactEmail}>, ${brief.contactRole}`,
    "",
    `Problem: ${brief.problem}`,
    "",
    `Current workflow: ${brief.currentWorkflow}`,
    "",
    `Existing software: ${brief.existingSoftware || "—"}`,
    "",
    `Desired outcome: ${brief.desiredOutcome}`,
    "",
    `Budget range: ${brief.budgetRange}`,
    `Timeline: ${brief.timeline}`,
  ].join("\n");
}

export async function sendBriefNotification(
  briefId: string,
  brief: ProjectBrief,
  env: NotificationEnv = process.env,
  fetchImpl: typeof fetch = fetch,
  /**
   * Override for the provider deadline. Production never passes it; tests do,
   * because `AbortSignal.timeout` is backed by a platform timer that JS fake
   * timers cannot advance, and waiting the real ten seconds would make the
   * suite slow and timing-sensitive.
   */
  timeoutMs: number = NOTIFICATION_TIMEOUT_MS,
): Promise<BriefNotificationResult> {
  if (!isNotificationConfigured(env)) {
    return { sent: false, reason: "not-configured" };
  }

  /*
    `AbortSignal.timeout` throws a `RangeError` for a non-finite, negative, or
    out-of-range delay. Caught silently by the block below, that would report
    `network-error` for a request that was never issued — email stops and the
    reason points at the provider. Fall back to the constant so a bad override
    cannot prevent the notification request from being issued.
  */
  const deadlineMs =
    Number.isFinite(timeoutMs) && timeoutMs > 0 && timeoutMs <= 4_294_967_295
      ? timeoutMs
      : NOTIFICATION_TIMEOUT_MS;

  try {
    const response = await fetchImpl(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.BRIEF_NOTIFICATION_FROM ?? `${siteConfig.name} <onboarding@resend.dev>`,
        to: [env.BRIEF_NOTIFICATION_EMAIL],
        subject: `New project brief ${briefId} — ${brief.companyName}`,
        text: buildPlainText(briefId, brief),
      }),
      // A stalled provider must not hold the invocation open; the abort lands
      // in the catch below and is reported exactly like any other failure.
      signal: AbortSignal.timeout(deadlineMs),
    });

    if (!response.ok) {
      return { sent: false, reason: `provider-${response.status}` };
    }
    return { sent: true };
  } catch {
    return { sent: false, reason: "network-error" };
  }
}
