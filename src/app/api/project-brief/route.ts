import { NextResponse } from "next/server";
import { z } from "zod";
import { createRateLimiter } from "@/lib/rate-limit";
import { resolveClientAddress } from "@/lib/client-ip";
import { recommendedNextStep } from "@/lib/intake";
import {
  MAX_BRIEF_BYTES,
  projectBriefSchema,
  type ProjectBrief,
} from "@/lib/validation";
import {
  isNotificationConfigured,
  sendBriefNotification,
} from "@/lib/brief-notification";

/**
 * Server-side intake endpoint.
 *
 * Security measures, in the order they run:
 *   1. per-caller rate limit, keyed on a proxy-attested address (see
 *      `resolveClientAddress` — the left-most `x-forwarded-for` entry is
 *      client-writable and is deliberately not trusted)
 *   2. transport-level body cap (`MAX_BRIEF_BYTES`) before any parsing, so an
 *      oversized payload is rejected without being buffered or scanned
 *   3. Zod schema validation with length bounds applied before sanitization
 *   4. honeypot rejection
 *   5. no secret exposure, no brief content in logs, no-store on the response
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

/** Responses carry personal data: never let a CDN or browser cache them. */
const NO_STORE = { "Cache-Control": "no-store" } as const;

function failure(error: string, status: number, extra?: object, headers?: HeadersInit) {
  return NextResponse.json({ ok: false, error, ...extra }, { status, headers });
}

export async function POST(request: Request) {
  const ip = resolveClientAddress(request.headers);

  const limit = limiter.check(ip);
  if (!limit.allowed) {
    return failure("Too many submissions. Please try again shortly.", 429, undefined, {
      ...NO_STORE,
      "Retry-After": String(limit.retryAfterSeconds),
    });
  }

  /*
    Reject oversized payloads on the declared length before reading the stream,
    then re-check the bytes actually received. A missing or lying
    Content-Length is exactly why the second check exists.
  */
  const declaredLength = Number(request.headers.get("content-length") ?? "");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BRIEF_BYTES) {
    return failure("Payload too large.", 413, undefined, NO_STORE);
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return failure("Invalid request body.", 400, undefined, NO_STORE);
  }

  if (new TextEncoder().encode(raw).byteLength > MAX_BRIEF_BYTES) {
    return failure("Payload too large.", 413, undefined, NO_STORE);
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return failure("Invalid request body.", 400, undefined, NO_STORE);
  }

  const parsed = projectBriefSchema.safeParse(body);
  if (!parsed.success) {
    return failure("Validation failed. Please review your answers.", 422, {
      issues: z.flattenError(parsed.error).fieldErrors,
    }, NO_STORE);
  }

  const brief: ProjectBrief = parsed.data;
  const briefId = generateBriefId();

  /*
    Honeypot. Only a bot can fill a field that is hidden from humans, so this
    returns a receipt indistinguishable from a real one and stops — no email, no
    log entry naming the field, nothing that would let a script tune its way past
    the trap. The client-side wizard short-circuits the same way before reaching
    the network, so no human path depends on this branch.
  */
  if (brief.companyWebsite) {
    return NextResponse.json(
      {
        ok: true,
        briefId,
        nextStep: recommendedNextStep(brief),
      },
      { headers: NO_STORE },
    );
  }

  /**
   * STORAGE INTEGRATION POINT
   * Email delivery is active when RESEND_API_KEY + BRIEF_NOTIFICATION_EMAIL
   * are configured (see brief-notification.ts). For database/CRM storage,
   * persist `brief` (validated & sanitized) here — notification failures
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

  return NextResponse.json(
    {
      ok: true,
      briefId,
      nextStep: recommendedNextStep(brief),
    },
    { headers: NO_STORE },
  );
}
