/*
 * Local credential authentication.
 *
 * Replaces the previous third-party OAuth handshake. Three endpoints, no
 * redirects, no external calls:
 *
 *   POST /api/auth/register  { email, password, name, role? }
 *   POST /api/auth/login     { email, password }
 *   POST /api/auth/logout
 */
import { COOKIE_NAME, MIN_PASSWORD_LENGTH, SESSION_TTL_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { z } from "zod";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { hashPassword, verifyPassword } from "./password";
import { createSessionToken } from "./session";

const roles = ["teacher", "coordinator"] as const;

const credentials = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  password: z.string().min(1).max(400),
});

const registration = credentials.extend({
  password: z.string().min(MIN_PASSWORD_LENGTH).max(400),
  name: z.string().trim().min(1).max(160),
  role: z.enum(roles).optional(),
});

function setSessionCookie(req: Request, res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    ...getSessionCookieOptions(req),
    maxAge: SESSION_TTL_MS,
  });
}

export function registerAuthRoutes(app: Express) {
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const parsed = registration.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid registration details", issues: parsed.error.issues });
      return;
    }

    const { email, password, name, role } = parsed.data;

    try {
      if (await db.getUserByEmail(email)) {
        res.status(409).json({ error: "An account with that email already exists" });
        return;
      }

      const userId = await db.createUserWithPassword({
        email,
        name,
        role: role ?? "teacher",
        passwordHash: await hashPassword(password),
      });

      setSessionCookie(req, res, await createSessionToken(userId));
      res.status(201).json({ ok: true });
    } catch (error) {
      console.error("[Auth] Registration failed", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const parsed = credentials.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const { email, password } = parsed.data;

    try {
      const user = await db.getUserByEmail(email);

      // Always run a verification so a missing account and a wrong password
      // take comparable time and cannot be told apart by response timing.
      const ok = await verifyPassword(password, user?.passwordHash ?? null);

      if (!user || !ok) {
        res.status(401).json({ error: "Incorrect email or password" });
        return;
      }

      await db.touchLastSignedIn(user.id);
      setSessionCookie(req, res, await createSessionToken(user.id));
      res.json({ ok: true });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(req), maxAge: -1 });
    res.json({ ok: true });
  });
}
