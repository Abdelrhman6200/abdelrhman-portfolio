export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
export const UNAUTHED_ERR_MSG = "Please sign in (10001)";
export const NOT_ADMIN_ERR_MSG = "You do not have the required permission (10002)";

/** Minimum password length accepted at registration. Shared so the client can
 *  validate before a round trip and the server can enforce it. */
export const MIN_PASSWORD_LENGTH = 10;
