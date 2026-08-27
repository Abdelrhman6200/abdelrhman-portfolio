import { MIN_PASSWORD_LENGTH } from "@shared/const";

export { COOKIE_NAME, ONE_YEAR_MS, MIN_PASSWORD_LENGTH } from "@shared/const";

/**
 * Local credential auth. These post to this application's own endpoints — there
 * is no external identity provider, no redirect, and no state cookie to keep in
 * sync, so unlike the OAuth flow this replaced they are safe to call anywhere.
 */

export class AuthError extends Error {}

async function post(path: string, body?: unknown): Promise<void> {
  const response = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });

  if (response.ok) return;

  let message = "Something went wrong. Please try again.";
  try {
    const data = (await response.json()) as { error?: string };
    if (data?.error) message = data.error;
  } catch {
    // Non-JSON error body (proxy error page, network failure mid-response).
  }
  throw new AuthError(message);
}

export const login = (email: string, password: string) =>
  post("/api/auth/login", { email, password });

export const register = (input: {
  email: string;
  password: string;
  name: string;
  role?: "teacher" | "coordinator";
}) => post("/api/auth/register", input);

export const logoutRequest = () => post("/api/auth/logout");

/** Where unauthenticated users are sent. */
export const SIGN_IN_PATH = "/sign-in";

export const startLogin = () => {
  if (typeof window === "undefined") return;
  if (window.location.pathname === SIGN_IN_PATH) return;
  window.location.href = SIGN_IN_PATH;
};
