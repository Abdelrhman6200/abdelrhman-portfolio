/*
 * Session tokens replaced a hosted OAuth provider, so the properties that used
 * to be someone else's responsibility are pinned here.
 */
import { describe, expect, it } from "vitest";
import { SignJWT } from "jose";
import { createSessionToken, verifySessionToken } from "./_core/session";

describe("session tokens", () => {
  it("round-trips a user id", async () => {
    const token = await createSessionToken(42);
    expect(await verifySessionToken(token)).toBe(42);
  });

  it("rejects a missing token", async () => {
    expect(await verifySessionToken(undefined)).toBeNull();
    expect(await verifySessionToken(null)).toBeNull();
    expect(await verifySessionToken("")).toBeNull();
  });

  it("rejects a tampered token", async () => {
    const token = await createSessionToken(42);
    const [header, payload, signature] = token.split(".");

    // Same signature, different claims.
    const forgedPayload = Buffer.from(JSON.stringify({ sub: "999" })).toString("base64url");
    expect(await verifySessionToken(`${header}.${forgedPayload}.${signature}`)).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const foreign = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setSubject("42")
      .setExpirationTime(Math.floor(Date.now() / 1000) + 3600)
      .sign(new TextEncoder().encode("some-other-secret"));

    expect(await verifySessionToken(foreign)).toBeNull();
  });

  it("rejects an expired token", async () => {
    const expired = await createSessionToken(42, { expiresInMs: -1000 });
    expect(await verifySessionToken(expired)).toBeNull();
  });

  it("rejects a token whose subject is not a usable user id", async () => {
    for (const sub of ["0", "-1", "not-a-number", "1.5"]) {
      const token = await new SignJWT({})
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setSubject(sub)
        .setExpirationTime(Math.floor(Date.now() / 1000) + 3600)
        .sign(new TextEncoder().encode(process.env.SESSION_SECRET ?? "dev-only-insecure-session-secret-change-me"));

      expect(await verifySessionToken(token), sub).toBeNull();
    }
  });
});
