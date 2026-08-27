/*
 * Security posture: the rate limiter's window arithmetic and the cookie flags
 * that make sessions CSRF-resistant. These are the properties an attacker
 * probes first, so they are pinned rather than assumed.
 */
import { describe, expect, it } from "vitest";
import type { Request } from "express";
import { createRateLimiter } from "./_core/rateLimit";
import { getSessionCookieOptions } from "./_core/cookies";

describe("rate limiter", () => {
  it("allows up to the limit, then refuses", () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 60_000 });
    expect(limiter.attempt("k", 0)).toBe(true);
    expect(limiter.attempt("k", 1_000)).toBe(true);
    expect(limiter.attempt("k", 2_000)).toBe(true);
    expect(limiter.attempt("k", 3_000)).toBe(false);
  });

  it("slides: capacity returns as old attempts leave the window", () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 10_000 });
    limiter.attempt("k", 0);
    limiter.attempt("k", 1_000);
    expect(limiter.attempt("k", 5_000)).toBe(false);
    // The attempt at t=0 has aged out by t=10s.
    expect(limiter.attempt("k", 10_500)).toBe(true);
  });

  it("keeps keys independent — one identity cannot exhaust another", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });
    expect(limiter.attempt("ip1:victim@x.com", 0)).toBe(true);
    expect(limiter.attempt("ip1:victim@x.com", 1)).toBe(false);
    expect(limiter.attempt("ip2:victim@x.com", 2)).toBe(true);
    expect(limiter.attempt("ip1:other@x.com", 3)).toBe(true);
  });

  it("reset clears the window, so a successful login never accrues", () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 60_000 });
    limiter.attempt("k", 0);
    limiter.attempt("k", 1);
    limiter.reset("k");
    expect(limiter.attempt("k", 2)).toBe(true);
  });

  it("reports a sane retry-after only while blocked", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 30_000 });
    expect(limiter.retryAfterSeconds("k", 0)).toBe(0);
    limiter.attempt("k", 0);
    expect(limiter.retryAfterSeconds("k", 10_000)).toBe(20);
    expect(limiter.retryAfterSeconds("k", 31_000)).toBe(0);
  });
});

describe("session cookie posture", () => {
  const request = { protocol: "https", headers: {} } as unknown as Request;
  const options = getSessionCookieOptions(request);

  it("is httpOnly, so scripts cannot read the session", () => {
    expect(options.httpOnly).toBe(true);
  });

  it("is SameSite-Lax, so cross-site POSTs never carry the session", () => {
    // "none" would hand every state-changing endpoint to CSRF; "lax" makes the
    // browser withhold the cookie from cross-site subrequests.
    expect(options.sameSite).toBe("lax");
  });

  it("is Secure over https", () => {
    expect(options.secure).toBe(true);
  });
});
