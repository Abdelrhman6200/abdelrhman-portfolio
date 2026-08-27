/*
 * Session handling.
 *
 * Sessions are stateless HMAC-signed JWTs held in an httpOnly cookie. The only
 * identity source is this application's own `users` table — there is no
 * external identity provider and no network call on the authentication path.
 */
import { COOKIE_NAME, SESSION_TTL_MS, UNAUTHED_ERR_MSG } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

export type SessionPayload = {
  /** `users.id`, as a string, so the JWT `sub` claim stays conventional. */
  sub: string;
};

function secretKey(): Uint8Array {
  return new TextEncoder().encode(ENV.sessionSecret);
}

export async function createSessionToken(
  userId: number,
  options: { expiresInMs?: number } = {}
): Promise<string> {
  const expiresInMs = options.expiresInMs ?? SESSION_TTL_MS;

  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(Math.floor((Date.now() + expiresInMs) / 1000))
    .sign(secretKey());
}

export async function verifySessionToken(token: string | undefined | null): Promise<number | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    const userId = Number(payload.sub);
    return Number.isInteger(userId) && userId > 0 ? userId : null;
  } catch {
    // Expired, tampered with, or signed under a rotated secret.
    return null;
  }
}

function readSessionCookie(req: Request): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  return parseCookieHeader(header)[COOKIE_NAME];
}

/**
 * Resolve the signed-in user, or throw. Callers that treat authentication as
 * optional should catch and fall back to `null` (see `createContext`).
 */
export async function authenticateRequest(req: Request): Promise<User> {
  const userId = await verifySessionToken(readSessionCookie(req));
  if (userId === null) {
    throw new Error(UNAUTHED_ERR_MSG);
  }

  const user = await db.getUserById(userId);
  if (!user) {
    // The account was deleted while a session cookie was still live.
    throw new Error(UNAUTHED_ERR_MSG);
  }

  return user;
}
