/**
 * Validates and normalizes HTTP and HTTPS web URLs.
 * Automatically prepends https:// if scheme is omitted.
 * Preserves query parameters, tokens, and fragment hashes.
 */
export function normalizeWebUrl(val: string, requireHttps = false): string {
  const trimmed = val.trim();
  if (!trimmed) {
    throw new Error('Please enter a website URL');
  }

  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed);
  const candidate = hasScheme ? trimmed : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error('Please enter a valid website URL (e.g. example.com or https://example.com)');
  }

  const allowedProtocols = requireHttps ? ['https:'] : ['http:', 'https:'];
  if (!allowedProtocols.includes(parsed.protocol)) {
    throw new Error(
      requireHttps
        ? 'Only secure HTTPS URLs are supported'
        : 'Only HTTP and HTTPS web URLs are supported'
    );
  }

  // Reject empty or invalid hostnames
  if (
    !parsed.hostname ||
    parsed.hostname.startsWith('.') ||
    (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost')
  ) {
    throw new Error('Please enter a valid website hostname');
  }

  return parsed.toString();
}
