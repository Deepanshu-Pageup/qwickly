import 'server-only';

/**
 * Regular expression policy defining acceptable incoming request ID values.
 * Strictly permits alphanumeric characters, hyphens, and underscores between 16 and 64 characters.
 * Rejects whitespace, control characters, special symbols, or arbitrary input lengths to prevent
 * header injection, log poisoning, or unvalidated reflection.
 */
const REQUEST_ID_REGEX = /^[a-zA-Z0-9_-]{16,64}$/;

/**
 * Standard header name used for request tracing and correlation.
 */
export const REQUEST_ID_HEADER = 'X-Request-ID';

/**
 * Resolves a request correlation ID for an incoming HTTP request.
 *
 * Implements a strict untrusted input validation policy:
 * - If the incoming `X-Request-ID` header matches the length and character whitelist policy,
 *   it is accepted and retained for end-to-end tracing across upstream callers.
 * - If the header is missing, blank, or fails the validation policy, a new cryptographically
 *   secure RFC 4122 UUID is generated using the Web Crypto API (`crypto.randomUUID()`).
 *
 * @param request - Incoming web Request or NextRequest.
 * @returns A validated or newly generated request ID string.
 */
export function resolveRequestId(request: Request): string {
  const incomingId = request.headers.get(REQUEST_ID_HEADER)?.trim();

  // Validate the incoming header against the strict whitelist policy
  if (incomingId && REQUEST_ID_REGEX.test(incomingId)) {
    return incomingId;
  }

  // Fallback to generating a fresh, collision-resistant UUIDv4
  return crypto.randomUUID();
}
