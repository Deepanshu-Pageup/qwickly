import 'server-only';
import { ZodError } from 'zod';
import { NextResponse } from 'next/server';
import { REQUEST_ID_HEADER } from './request-id';

/**
 * Standard error codes used across the API for predictable client handling.
 */
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_SERVER_ERROR';

/**
 * Standardized structure of validation error details.
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
}

/**
 * Proposed API error response envelope structure adhering to Sub-plan 1.4.3.
 */
export interface ApiErrorEnvelope {
  error: {
    code: ErrorCode | string;
    message: string;
    requestId: string;
    details?: ValidationErrorDetail[] | unknown;
  };
}

/**
 * Base application error class for expected domain and HTTP exceptions.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode | string;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode = 400,
    code: ErrorCode | string = 'BAD_REQUEST',
    details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * 400 Bad Request error.
 */
export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', details?: unknown) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

/**
 * 401 Unauthorized error.
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * 403 Forbidden error.
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * 404 Not Found error.
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * 409 Conflict error.
 */
export class ConflictError extends AppError {
  constructor(message = 'Conflict with current resource state') {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * Maps Zod validation issues into sanitized, human-readable field errors.
 */
export function mapZodIssues(error: ZodError): ValidationErrorDetail[] {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
}

/**
 * Formats an unknown exception into a standardized, secure API error envelope.
 *
 * Guarantees that internal implementation details, raw database errors, and stack
 * traces are masked behind generic error messages, while logging diagnostic context
 * securely to standard server output tagged with the correlated request ID.
 *
 * @param error - The caught exception.
 * @param requestId - Correlated request ID resolved for the current request.
 * @returns Standard Next.js NextResponse containing the error envelope and X-Request-ID header.
 */
export function formatErrorResponse(
  error: unknown,
  requestId: string
): NextResponse<ApiErrorEnvelope> {
  // Case 1: Zod validation failure (e.g. invalid query params, headers, or body payload)
  if (error instanceof ZodError) {
    const details = mapZodIssues(error);
    const body: ApiErrorEnvelope = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'The request contains invalid data',
        requestId,
        details,
      },
    };
    return NextResponse.json(body, {
      status: 400,
      headers: { [REQUEST_ID_HEADER]: requestId },
    });
  }

  // Case 2: Malformed JSON syntax error during request body parsing
  if (error instanceof SyntaxError && 'message' in error && error.message.includes('JSON')) {
    const body: ApiErrorEnvelope = {
      error: {
        code: 'BAD_REQUEST',
        message: 'Malformed JSON body',
        requestId,
      },
    };
    return NextResponse.json(body, {
      status: 400,
      headers: { [REQUEST_ID_HEADER]: requestId },
    });
  }

  // Case 3: Known application domain errors (explicitly thrown with safe status and code)
  if (error instanceof AppError) {
    const body: ApiErrorEnvelope = {
      error: {
        code: error.code,
        message: error.message,
        requestId,
        ...(error.details ? { details: error.details } : {}),
      },
    };
    return NextResponse.json(body, {
      status: error.statusCode,
      headers: { [REQUEST_ID_HEADER]: requestId },
    });
  }

  // Case 4: Unexpected server exception (e.g., database connection down, unexpected null pointer)
  // Structured logging to server console preserves stack trace and message for investigation
  // without leaking any sensitive system internals to the API caller.
  console.error(`[RequestId: ${requestId}] Unhandled API Error:`, error);

  const fallbackBody: ApiErrorEnvelope = {
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
      requestId,
    },
  };

  return NextResponse.json(fallbackBody, {
    status: 500,
    headers: { [REQUEST_ID_HEADER]: requestId },
  });
}
