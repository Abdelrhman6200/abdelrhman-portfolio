/*
 * Password hashing — scrypt from node:crypto, so the app gains no dependency
 * for something this security-sensitive.
 *
 * Stored format: `scrypt$N$r$p$<salt-b64>$<hash-b64>`. The parameters travel
 * with the hash, so they can be raised later without invalidating existing
 * passwords: an old hash still verifies under its own recorded parameters.
 */
import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  type ScryptOptions,
} from "node:crypto";

/**
 * `promisify` collapses scrypt's overloads and drops the options parameter, so
 * the options-taking form is wrapped by hand instead.
 */
function scrypt(
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, keylen, options, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

/** OWASP-recommended baseline for scrypt (N=2^17, r=8, p=1). */
const PARAMS = { N: 131072, r: 8, p: 1 };
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

// scrypt needs roughly 128 * N * r bytes; the default 32MB cap is too low for
// N=2^17, so raise it to match the parameters above.
const MAX_MEMORY = 256 * 1024 * 1024;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const derived = await scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, {
    ...PARAMS,
    maxmem: MAX_MEMORY,
  });

  return [
    "scrypt",
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    salt.toString("base64"),
    derived.toString("base64"),
  ].join("$");
}

export async function verifyPassword(password: string, stored: string | null | undefined): Promise<boolean> {
  if (!stored) return false;

  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, rawN, rawR, rawP, rawSalt, rawHash] = parts;
  const N = Number(rawN);
  const r = Number(rawR);
  const p = Number(rawP);
  if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p)) return false;

  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(rawSalt, "base64");
    expected = Buffer.from(rawHash, "base64");
  } catch {
    return false;
  }
  if (expected.length === 0) return false;

  let derived: Buffer;
  try {
    derived = await scrypt(password.normalize("NFKC"), salt, expected.length, {
      N,
      r,
      p,
      maxmem: MAX_MEMORY,
    });
  } catch {
    // Malformed parameters recorded in the hash.
    return false;
  }

  // Lengths always match here (derived is sized from `expected`), so this is a
  // constant-time comparison of equal-length buffers.
  return timingSafeEqual(derived, expected);
}
