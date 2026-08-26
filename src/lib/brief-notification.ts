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
): Promise<BriefNotificationResult> {
  if (!isNotificationConfigured(env)) {
    return { sent: false, reason: "not-configured" };
  }

  try {
    const response = await fetchImpl(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.BRIEF_NOTIFICATION_FROM ?? "VANTIQ SYSTEMS <onboarding@resend.dev>",
        to: [env.BRIEF_NOTIFICATION_EMAIL],
        subject: `New project brief ${briefId} — ${brief.companyName}`,
        text: buildPlainText(briefId, brief),
      }),
    });

    if (!response.ok) {
      return { sent: false, reason: `provider-${response.status}` };
    }
    return { sent: true };
  } catch {
    return { sent: false, reason: "network-error" };
  }
}
