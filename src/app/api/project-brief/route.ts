import { NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/rate-limit";
import {
  isNotificationConfigured,
  sendBriefNotification,
} from "@/lib/brief-notification";
import {
  projectBriefSchema,
  recommendedNextStep,
  type ProjectBrief,
} from "@/lib/validation";

/**
 * Server-side intake endpoint.
 *
 * Security measures: Zod schema validation, per-IP rate limiting, honeypot
 * rejection, input sanitisation (schema-level), no secret exposure, minimal
 * data retention until a storage provider is connected.
 *
 * Delivery: when RESEND_API_KEY + BRIEF_NOTIFICATION_EMAIL are set in the
 * host environment, every accepted brief is emailed to that inbox. Without
 * them the endpoint receipts only — see src/lib/brief-notification.ts.
 */

const limiter = createRateLimiter({ windowMs: 60_000, max: 5 });

function generateBriefId(): string {
  const time = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PB-${time}-${rand}`;
}

export async function POST(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || "unknown";

  const limit = limiter.check(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many submissions. Please try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = projectBriefSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Validation failed. Please review your answers.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  const brief: ProjectBrief = parsed.data;
  const briefId = generateBriefId();

  /**
   * STORAGE INTEGRATION POINT
   * Email delivery is active when RESEND_API_KEY + BRIEF_NOTIFICATION_EMAIL
   * are configured (see brief-notification.ts). For database/CRM storage,
   * persist `brief` (validated & sanitised) here — notification failures
   * must never block the receipt below.
   */
  const notification = await sendBriefNotification(briefId, brief);

  if (process.env.NODE_ENV !== "production") {
    // Never log brief content — only the receipt marker and delivery mode.
    const mode = isNotificationConfigured()
      ? notification.sent
        ? "emailed"
        : `email-failed:${notification.reason}`
      : "receipt-only";
    console.log(`[project-brief] accepted ${briefId} (${mode})`);
  }

  return NextResponse.json({
    ok: true,
    briefId,
    nextStep: recommendedNextStep(brief),
  });
}
