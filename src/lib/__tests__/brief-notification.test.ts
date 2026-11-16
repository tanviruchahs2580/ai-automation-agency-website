import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isNotificationConfigured,
  sendBriefNotification,
} from "@/lib/brief-notification";
import { projectBriefSchema } from "@/lib/validation";

const validBrief = projectBriefSchema.parse({
  companyName: "Acme Corp",
  companySize: "51 – 250",
  industry: "Logistics",
  country: "Germany",
  contactName: "Jane Doe",
  contactEmail: "jane@acme.test",
  contactRole: "CTO",
  problem:
    "Invoice processing is fully manual across three regional teams causing delays.",
  currentWorkflow: "Emails arrive as PDFs, staff key them into SAP by hand.",
  existingSoftware: "SAP, Outlook",
  desiredOutcome: "Automated intake with human approval on exceptions only.",
  budgetRange: "$75k – $200k",
  timeline: "Within 3 months",
  consent: true,
});

const configuredEnv = {
  RESEND_API_KEY: "test-key",
  BRIEF_NOTIFICATION_EMAIL: "hello@arkyon.example",
  BRIEF_NOTIFICATION_FROM: "ARKYON <briefs@arkyon.example>",
};

const fetchMock = () =>
  vi.fn<typeof fetch>(() =>
    Promise.resolve(new Response(JSON.stringify({ id: "email-1" }), { status: 200 })),
  );

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("isNotificationConfigured", () => {
  it("requires both API key and destination inbox", () => {
    expect(isNotificationConfigured({})).toBe(false);
    expect(isNotificationConfigured({ RESEND_API_KEY: "k" })).toBe(false);
    expect(
      isNotificationConfigured({ BRIEF_NOTIFICATION_EMAIL: "x@y.z" }),
    ).toBe(false);
    expect(isNotificationConfigured(configuredEnv)).toBe(true);
  });
});

describe("sendBriefNotification", () => {
  it("is a no-op when not configured — no network call", async () => {
    const fetchImpl = fetchMock();
    const result = await sendBriefNotification(
      "PB-TEST-0001",
      validBrief,
      {},
      fetchImpl as unknown as typeof fetch,
    );
    expect(result).toEqual({ sent: false, reason: "not-configured" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("sends a plain-text email with reference ID and brief fields", async () => {
    const fetchImpl = fetchMock();
    const result = await sendBriefNotification(
      "PB-TEST-0002",
      validBrief,
      configuredEnv,
      fetchImpl as unknown as typeof fetch,
    );
    expect(result).toEqual({ sent: true });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [, init] = fetchImpl.mock.calls[0];
    expect(init?.method).toBe("POST");
    expect((init?.headers as Record<string, string>).Authorization).toBe(
      `Bearer ${configuredEnv.RESEND_API_KEY}`,
    );

    const body = JSON.parse(String(init?.body));
    expect(body.from).toBe(configuredEnv.BRIEF_NOTIFICATION_FROM);
    expect(body.to).toEqual([configuredEnv.BRIEF_NOTIFICATION_EMAIL]);
    expect(body.subject).toContain("PB-TEST-0002");
    expect(body.subject).toContain("Acme Corp");
    for (const field of [
      "jane@acme.test",
      "Logistics",
      "Germany",
      "$75k – $200k",
      "Within 3 months",
    ]) {
      expect(body.text).toContain(field);
    }
  });

  it("falls back to the provider default sender when FROM is unset", async () => {
    const fetchImpl = fetchMock();
    await sendBriefNotification(
      "PB-TEST-0003",
      validBrief,
      {
        RESEND_API_KEY: "k",
        BRIEF_NOTIFICATION_EMAIL: "in@box.test",
      },
      fetchImpl as unknown as typeof fetch,
    );
    const body = JSON.parse(String(fetchImpl.mock.calls[0][1]?.body));
    expect(body.from).toContain("onboarding@resend.dev");
  });

  it("reports provider rejection without throwing", async () => {
    const failing = vi.fn(() =>
      Promise.resolve(new Response("boom", { status: 500 })),
    );
    const result = await sendBriefNotification(
      "PB-TEST-0004",
      validBrief,
      configuredEnv,
      failing as unknown as typeof fetch,
    );
    expect(result).toEqual({ sent: false, reason: "provider-500" });
  });

  it("reports network errors without throwing", async () => {
    const rejecting = vi.fn(() => Promise.reject(new Error("offline")));
    const result = await sendBriefNotification(
      "PB-TEST-0005",
      validBrief,
      configuredEnv,
      rejecting as unknown as typeof fetch,
    );
    expect(result).toEqual({ sent: false, reason: "network-error" });
  });

  it("uses the default deadline when the test override is invalid", async () => {
    const fetchImpl = fetchMock();
    const result = await sendBriefNotification(
      "PB-TEST-0007",
      validBrief,
      configuredEnv,
      fetchImpl as unknown as typeof fetch,
      Number.POSITIVE_INFINITY,
    );

    expect(result).toEqual({ sent: true });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
  });

  it("aborts a stalled provider and still reports a receipt-level failure", async () => {
    /*
      The provider promise never settles on its own, so the only way this test
      finishes is the abort. The timeout is shortened because AbortSignal.timeout
      uses a platform timer that fake timers cannot advance.
    */
    let abortedSignal: AbortSignal | null | undefined;
    const stalling = vi.fn((_url: string, init?: RequestInit) => {
      const signal = init?.signal ?? null;
      abortedSignal = signal;
      return new Promise<Response>((_resolve, reject) => {
        signal?.addEventListener("abort", () => {
          reject(signal.reason ?? new DOMException("aborted", "AbortError"));
        });
      });
    });

    const startedAt = Date.now();
    const result = await sendBriefNotification(
      "PB-TEST-0006",
      validBrief,
      configuredEnv,
      stalling as unknown as typeof fetch,
      20,
    );
    const elapsed = Date.now() - startedAt;

    expect(abortedSignal).toBeInstanceOf(AbortSignal);
    expect(abortedSignal?.aborted).toBe(true);
    expect(result).toEqual({ sent: false, reason: "network-error" });
    expect(elapsed).toBeLessThan(5_000);
  });
});
