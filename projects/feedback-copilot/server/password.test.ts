/*
 * Password hashing is the most security-sensitive code in the app, and it was
 * written to replace a hosted identity provider — so its guarantees are pinned
 * here rather than assumed.
 */
import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./_core/password";

// scrypt at N=2^17 is intentionally slow; give these room.
const TIMEOUT = 30_000;

describe("password hashing", () => {
  it(
    "accepts the correct password",
    async () => {
      const hash = await hashPassword("correct horse battery staple");
      expect(await verifyPassword("correct horse battery staple", hash)).toBe(true);
    },
    TIMEOUT
  );

  it(
    "rejects the wrong password",
    async () => {
      const hash = await hashPassword("correct horse battery staple");
      expect(await verifyPassword("Correct horse battery staple", hash)).toBe(false);
      expect(await verifyPassword("", hash)).toBe(false);
    },
    TIMEOUT
  );

  it(
    "salts each hash, so identical passwords do not collide",
    async () => {
      const [a, b] = await Promise.all([hashPassword("same-password"), hashPassword("same-password")]);
      expect(a).not.toBe(b);
      expect(await verifyPassword("same-password", a)).toBe(true);
      expect(await verifyPassword("same-password", b)).toBe(true);
    },
    TIMEOUT
  );

  it("refuses to authenticate an account with no password set", async () => {
    // Accounts may exist before a password is chosen; they must not be loggable
    // into by supplying any password at all.
    expect(await verifyPassword("anything", null)).toBe(false);
    expect(await verifyPassword("anything", undefined)).toBe(false);
    expect(await verifyPassword("anything", "")).toBe(false);
  });

  it("rejects malformed or truncated stored hashes rather than throwing", async () => {
    for (const malformed of [
      "not-a-hash",
      "scrypt$only$four$parts",
      "bcrypt$131072$8$1$c2FsdA==$aGFzaA==",
      "scrypt$abc$8$1$c2FsdA==$aGFzaA==",
      "scrypt$131072$8$1$c2FsdA==$",
    ]) {
      expect(await verifyPassword("anything", malformed), malformed).toBe(false);
    }
  });

  it(
    "records its parameters in the hash, so they can be raised later",
    async () => {
      const hash = await hashPassword("parameterised");
      const [scheme, n, r, p] = hash.split("$");
      expect(scheme).toBe("scrypt");
      expect(Number(n)).toBeGreaterThanOrEqual(131072);
      expect(Number(r)).toBe(8);
      expect(Number(p)).toBe(1);
    },
    TIMEOUT
  );
});
