import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { REQUEST_ID_HEADER, resolveRequestId } from './request-id';
import { formatErrorResponse } from './errors';

/**
 * Context provided to route handler functions, containing the validated request ID
 * and route parameters if present.
 */
export interface ApiHandlerContext<TParams = Record<string, string | string[]>> {
  requestId: string;
  params?: Promise<TParams> | TParams;
}

/**
 * Type definition for API route handler logic wrapped by createApiHandler.
 */
export type ApiRouteHandler<TParams = Record<string, string | string[]>> = (
  request: NextRequest,
  context: ApiHandlerContext<TParams>
) => Promise<Response | NextResponse> | Response | NextResponse;

/**
 * Higher-order Route Handler wrapper for Next.js App Router API endpoints.
 *
 * Enforces the following core API contracts:
 * 1. Single-point request ID resolution: Resolves or validates the `X-Request-ID` header
 *    exactly once per request and provides it to the inner handler context.
 * 2. Guaranteed header propagation: Ensures the `X-Request-ID` header is attached to all outbound responses.
 * 3. Centralized error interception: Catches synchronous and asynchronous exceptions, maps them
 *    through `formatErrorResponse`, and returns standardized, safe error envelopes.
 * 4. Structured diagnostics: Automatically associates unhandled failures with the correlated request ID.
 *
 * @param handler - The route handler business logic.
 * @returns A Next.js route handler function compatible with Next.js App Router route.ts exports.
 */
export function createApiHandler<TParams = Record<string, string | string[]>>(
  handler: ApiRouteHandler<TParams>
) {
  return async (
    request: NextRequest,
    context?: { params?: Promise<TParams> | TParams }
  ): Promise<Response> => {
    // Step 1: Resolve the request correlation ID exactly once at the boundary
    const requestId = resolveRequestId(request);

    try {
      // Step 2: Invoke the business route handler with the validated request context
      const response = await handler(request, {
        requestId,
        params: context?.params,
      });

      // Step 3: Ensure X-Request-ID header is always attached to the outgoing response
      // Handles native Response or Next.js NextResponse instances seamlessly
      if (response instanceof Response && !response.headers.has(REQUEST_ID_HEADER)) {
        response.headers.set(REQUEST_ID_HEADER, requestId);
      }

      return response;
    } catch (error) {
      // Step 4: Intercept failures and construct a standardized error envelope
      return formatErrorResponse(error, requestId);
    }
  };
}
