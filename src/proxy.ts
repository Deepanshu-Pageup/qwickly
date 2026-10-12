import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Standard CORS preflight response headers.
 * Defines allowed HTTP methods and headers for cross-origin API requests.
 */
const CORS_OPTIONS = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Request-ID',
  'Access-Control-Expose-Headers': 'X-Request-ID',
  'Access-Control-Max-Age': '86400', // Cache preflight response for 24 hours to reduce handshake overhead
};

/**
 * Resolves the list of trusted origins authorized for cross-origin access.
 * Parses comma-separated values from the environment, defaulting safely in development.
 */
function getAllowedOrigins(): string[] {
  const configured = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  // In development, automatically allow local Next.js dev server origins if unconfigured
  if (configured.length === 0 && process.env.NODE_ENV !== 'production') {
    return ['http://localhost:3000', 'http://127.0.0.1:3000'];
  }

  return configured;
}

/**
 * Next.js 16 Proxy handler (supersedes deprecated middleware convention).
 * Scoped to intercept /api/:path* requests to manage cross-origin access and preflight negotiation.
 */
export function proxy(request: NextRequest) {
  const origin = request.headers.get('origin');
  const isPreflight = request.method === 'OPTIONS';

  // If no Origin header is sent, this is a same-origin request, server-side fetch,
  // or a non-browser client. Allow it to pass through directly.
  if (!origin) {
    return NextResponse.next();
  }

  const allowedOrigins = getAllowedOrigins();
  const isAllowedOrigin = allowedOrigins.includes(origin);

  // Handle CORS preflight (OPTIONS) requests
  if (isPreflight) {
    // If the origin is not on the whitelist, reject the preflight early
    if (!isAllowedOrigin) {
      return new NextResponse(null, {
        status: 403,
        statusText: 'Forbidden - CORS origin denied',
      });
    }

    // Origin is valid: respond with 204 No Content and necessary access control headers.
    // Short-circuits execution before invoking downstream route handlers.
    const preflightHeaders = new Headers({
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      ...CORS_OPTIONS,
    });

    return new NextResponse(null, {
      status: 204,
      headers: preflightHeaders,
    });
  }

  // Handle simple / non-preflight requests
  const response = NextResponse.next();

  // If the origin is authorized, attach Access-Control headers to the response.
  // Note: Echoing the specific allowed origin (rather than '*') prevents cross-origin
  // wildcard exploits when credentialed cookies are present.
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    Object.entries(CORS_OPTIONS).forEach(([header, value]) => {
      response.headers.set(header, value);
    });
  }

  return response;
}

/**
 * Matcher configuration for Next.js 16 Proxy.
 * Strictly scopes proxy execution to API route handlers.
 */
export const config = {
  matcher: ['/api/:path*'],
};
