/*
 * Runtime configuration. Every value is a plain environment variable — the app
 * has no dependency on any hosting platform's injected config.
 */

function required(name: string, value: string): string {
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(
      `${name} must be set in production. Refusing to start with an insecure default.`
    );
  }
  return value;
}

/**
 * Development-only fallback for the session signing key.
 *
 * Deliberately constant so `npm run dev` works with no setup, and deliberately
 * rejected in production by `required()` above — a predictable signing key
 * would let anyone mint a valid session.
 */
const DEV_SESSION_SECRET = "dev-only-insecure-session-secret-change-me";

export const ENV = {
  isProduction: process.env.NODE_ENV === "production",

  databaseUrl: process.env.DATABASE_URL ?? "",

  /** HMAC key for session JWTs. */
  sessionSecret: required(
    "SESSION_SECRET",
    process.env.SESSION_SECRET ?? process.env.JWT_SECRET ?? DEV_SESSION_SECRET
  ),

  /**
   * Any OpenAI-compatible endpoint (OpenAI, Azure OpenAI, a local Ollama/vLLM
   * gateway, or a self-hosted proxy). Left empty, AI features report themselves
   * as unavailable rather than failing at call time.
   */
  llmBaseUrl: (process.env.LLM_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, ""),
  llmApiKey: process.env.LLM_API_KEY ?? process.env.OPENAI_API_KEY ?? "",
  llmModel: process.env.LLM_MODEL ?? "gpt-4o-mini",
};

/** Whether AI-assisted features can run. */
export const llmConfigured = (): boolean => Boolean(ENV.llmApiKey);
