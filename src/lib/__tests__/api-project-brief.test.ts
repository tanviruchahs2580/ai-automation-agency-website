import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Route-level behaviour of the intake endpoint.
 *
 * The pure schema is covered in `validation.test.ts`; this exercises the handler
 * itself, because two of its security properties only exist at the route layer:
 * the honeypot is deliberately *not* a validation error, and the body cap is
 * enforced before validation runs.
 */

const sendBriefNotification = vi.fn(async () => ({ sent: false as const, reason: "not-configured" as const }));

vi.mock("@/lib/brief-notification", () => ({
  sendBriefNotification: (...args: unknown[]) => sendBriefNotification(...(args as [])),
  isNotificationConfigured: () => false,
}));

const { POST } = await import("@/app/api/project-brief/route");

const validBrief = {
  companyName: "Acme Manufacturing",
  companySize: "51 – 250",
  industry: "Manufacturing",
  country: "Germany",
  contactName: "Jane Smith",
  contactEmail: "jane@acme.example",
  contactRole: "COO",
  problem: "Supplier invoices are keyed manually into SAP and approvals stall for days.",
  currentWorkflow: "Email intake, Excel matching, reply-all approval chains.",
  existingSoftware: "SAP, Outlook",
  desiredOutcome: "Straight-through processing of matched invoices with human review on exceptions.",
  budgetRange: "$75k – $200k",
  timeline: "Within 3 months",
  consent: true,
};

/**
 * Each call gets its own client address.
 *
 * The limiter allows 5 requests a minute per address and fails closed to a
 * single `"unknown"` bucket, so a shared address across these tests produced
 * 429s partway through the file. Giving each request a distinct
 * `x-forwarded-for` keeps the cases independent — and exercises the address
 * resolution at the same time. `rate limit` below deliberately reuses one.
 */
let clientCounter = 0;

function post(
  body: unknown,
  headers: Record<string, string> = {},
  clientIp = `198.51.100.${(clientCounter += 1) % 250}`,
) {
  return POST(
    new Request("https://example.com/api/project-brief", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": clientIp,
        ...headers,
      },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  sendBriefNotification.mockClear();
});

describe("POST /api/project-brief", () => {
  it("accepts a valid brief and returns a receipt", async () => {
    const response = await post(validBrief);
    expect(response.status).toBe(200);

    const json = (await response.json()) as { ok: boolean; briefId: string; nextStep: string };
    expect(json.ok).toBe(true);
    expect(json.briefId).toMatch(/^PB-[A-Z0-9]+-[A-Z0-9]+$/);
    expect(json.nextStep).toContain("automation");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("answers a filled honeypot with a receipt and never notifies", async () => {
    const response = await post({ ...validBrief, companyWebsite: "spam.example" });

    // Indistinguishable from a real submission: no 4xx, no field-level detail.
    expect(response.status).toBe(200);
    const json = (await response.json()) as { ok: boolean; briefId: string };
    expect(json.ok).toBe(true);
    expect(json.briefId).toBeTruthy();

    // And nothing is sent. A bot's payload must not reach the inbox.
    expect(sendBriefNotification).not.toHaveBeenCalled();
  });

  it("notifies for a genuine submission", async () => {
    await post(validBrief);
    expect(sendBriefNotification).toHaveBeenCalledTimes(1);
  });

  it("rejects a body larger than the transport cap", async () => {
    const response = await post("x".repeat(200 * 1024), {
      "Content-Length": String(200 * 1024),
    });
    expect(response.status).toBe(413);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(sendBriefNotification).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON without echoing the parser error", async () => {
    const response = await post("not json");
    expect(response.status).toBe(400);
    const json = (await response.json()) as { error: string };
    expect(json.error).toBe("Invalid request body.");
  });

  it("reports field errors for an invalid brief and never notifies", async () => {
    const response = await post({ ...validBrief, contactEmail: "not-an-email" });
    expect(response.status).toBe(422);
    const json = (await response.json()) as { issues: Record<string, string[]> };
    expect(Object.keys(json.issues)).toContain("contactEmail");
    expect(sendBriefNotification).not.toHaveBeenCalled();
  });

  it("rate limits a single client address after five requests", async () => {
    const ip = "203.0.113.77";
    const statuses: number[] = [];
    for (let i = 0; i < 6; i += 1) {
      statuses.push((await post(validBrief, {}, ip)).status);
    }
    expect(statuses.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
    expect(statuses[5]).toBe(429);
  });

  it("marks every response no-store, including failures", async () => {
    for (const body of [validBrief, "not json", { ...validBrief, contactEmail: "x" }]) {
      const response = await post(body);
      expect(response.headers.get("cache-control"), String(response.status)).toBe("no-store");
    }
  });
});
