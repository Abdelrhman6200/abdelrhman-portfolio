/*
 * Sliding-window rate limiter for the credential endpoints.
 *
 * In-memory and per-process, which is the right tool at this scale: it stops
 * online password guessing against a single instance without adding a Redis
 * dependency. A multi-instance deployment would move the counters to shared
 * storage; the interface here would not change.
 *
 * Keys combine IP and email, so an attacker cannot lock a victim out from a
 * different address, and a shared office IP is not blocked by one user's
 * typos alone.
 */

type Window = number[]; // timestamps of recent attempts, oldest first

export type RateLimiter = {
  /** Returns true when the attempt is allowed; records it either way. */
  attempt(key: string, now?: number): boolean;
  /** Clears a key — call on successful login so honest users never accrue. */
  reset(key: string): void;
  /** Seconds until the oldest attempt leaves the window. */
  retryAfterSeconds(key: string, now?: number): number;
};

export function createRateLimiter(options: { limit: number; windowMs: number }): RateLimiter {
  const { limit, windowMs } = options;
  const windows = new Map<string, Window>();

  const prune = (window: Window, now: number) => {
    while (window.length > 0 && now - window[0] >= windowMs) window.shift();
  };

  return {
    attempt(key, now = Date.now()) {
      const window = windows.get(key) ?? [];
      prune(window, now);
      if (window.length >= limit) {
        windows.set(key, window);
        return false;
      }
      window.push(now);
      windows.set(key, window);
      return true;
    },

    reset(key) {
      windows.delete(key);
    },

    retryAfterSeconds(key, now = Date.now()) {
      const window = windows.get(key);
      if (!window || window.length === 0) return 0;
      prune(window, now);
      if (window.length < limit) return 0;
      return Math.max(1, Math.ceil((window[0] + windowMs - now) / 1000));
    },
  };
}

/** 8 tries per identity per 10 minutes — generous for typos, hostile to scripts. */
export const loginLimiter = createRateLimiter({ limit: 8, windowMs: 10 * 60 * 1000 });

/** 5 new accounts per IP per hour. */
export const registerLimiter = createRateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 });
