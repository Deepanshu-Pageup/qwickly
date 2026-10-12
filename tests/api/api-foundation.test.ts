import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { resolveRequestId, REQUEST_ID_HEADER } from '../../src/server/api/request-id';
import {
  apiSuccess,
  apiCreated,
  apiNoContent,
  apiPaginated,
} from '../../src/server/api/response';
import {
  AppError,
  NotFoundError,
  formatErrorResponse,
} from '../../src/server/api/errors';
import { createApiHandler } from '../../src/server/api/handler';
import { GET as healthHandler } from '../../src/app/api/v1/health/route';

describe('Sub-plan 1.4: REST API Foundation Suite', () => {
  describe('Group A: Request ID Resolution Policy', () => {
    it('accepts a valid incoming UUIDv4 header', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const req = new NextRequest('http://localhost:3000/api/v1/health', {
        headers: { [REQUEST_ID_HEADER]: validUuid },
      });

      const resolved = resolveRequestId(req);
      assert.equal(resolved, validUuid);
    });

    it('accepts a valid alphanumeric trace slug (16 to 64 chars)', () => {
      const validSlug = 'custom_trace_id_1234567890';
      const req = new NextRequest('http://localhost:3000/api/v1/health', {
        headers: { [REQUEST_ID_HEADER]: validSlug },
      });

      const resolved = resolveRequestId(req);
      assert.equal(resolved, validSlug);
    });

    it('replaces a missing request ID header with a generated UUID', () => {
      const req = new NextRequest('http://localhost:3000/api/v1/health');
      const resolved = resolveRequestId(req);

      assert.ok(resolved);
      assert.match(
        resolved,
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it('replaces an invalid request ID (too short) with a generated UUID', () => {
      const req = new NextRequest('http://localhost:3000/api/v1/health', {
        headers: { [REQUEST_ID_HEADER]: 'short-id' },
      });
      const resolved = resolveRequestId(req);

      assert.notEqual(resolved, 'short-id');
      assert.match(
        resolved,
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it('replaces an invalid request ID with illegal characters (preventing header/log injection)', () => {
      const dirtyId = 'invalid id with spaces and <script>alert(1)</script>';
      const req = new NextRequest('http://localhost:3000/api/v1/health', {
        headers: { [REQUEST_ID_HEADER]: dirtyId },
      });
      const resolved = resolveRequestId(req);

      assert.notEqual(resolved, dirtyId);
      assert.match(
        resolved,
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });
  });

  describe('Group B: Response Formatting Utilities', () => {
    const testReqId = 'test-request-id-12345678';

    it('apiSuccess returns 200 OK with payload and X-Request-ID header', async () => {
      const data = { hello: 'world' };
      const res = apiSuccess(data, testReqId);

      assert.equal(res.status, 200);
      assert.equal(res.headers.get(REQUEST_ID_HEADER), testReqId);
      const json = await res.json();
      assert.deepEqual(json, data);
    });

    it('apiCreated returns 201 Created with payload and X-Request-ID header', async () => {
      const data = { id: 'qr_123', name: 'Test QR' };
      const res = apiCreated(data, testReqId);

      assert.equal(res.status, 201);
      assert.equal(res.headers.get(REQUEST_ID_HEADER), testReqId);
      const json = await res.json();
      assert.deepEqual(json, data);
    });

    it('apiNoContent returns 204 No Content with empty body and X-Request-ID header', async () => {
      const res = apiNoContent(testReqId);

      assert.equal(res.status, 204);
      assert.equal(res.headers.get(REQUEST_ID_HEADER), testReqId);
      const body = await res.text();
      assert.equal(body, '');
    });

    it('apiPaginated returns 200 OK with structured items and pagination metadata', async () => {
      const items = [{ id: 1 }, { id: 2 }];
      const pagination = {
        page: 1,
        pageSize: 10,
        totalItems: 2,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      };

      const res = apiPaginated(items, pagination, testReqId);
      assert.equal(res.status, 200);
      assert.equal(res.headers.get(REQUEST_ID_HEADER), testReqId);

      const json = await res.json();
      assert.deepEqual(json, { items, pagination });
    });
  });

  describe('Group C: Error Envelope & Sanitization', () => {
    const testReqId = 'err-request-id-12345678';

    it('formats ZodError into 400 VALIDATION_ERROR with structured details', async () => {
      const schema = z.object({
        email: z.string().email(),
        count: z.number().min(1),
      });

      const parsed = schema.safeParse({ email: 'invalid-email', count: 0 });
      assert.equal(parsed.success, false);

      if (!parsed.success) {
        const res = formatErrorResponse(parsed.error, testReqId);
        assert.equal(res.status, 400);
        assert.equal(res.headers.get(REQUEST_ID_HEADER), testReqId);

        const json = await res.json();
        assert.equal(json.error.code, 'VALIDATION_ERROR');
        assert.equal(json.error.message, 'The request contains invalid data');
        assert.equal(json.error.requestId, testReqId);
        assert.equal(Array.isArray(json.error.details), true);
        assert.equal(json.error.details.length, 2);
      }
    });

    it('formats JSON SyntaxError into 400 BAD_REQUEST', async () => {
      const syntaxError = new SyntaxError('Unexpected token in JSON at position 0');
      const res = formatErrorResponse(syntaxError, testReqId);

      assert.equal(res.status, 400);
      assert.equal(res.headers.get(REQUEST_ID_HEADER), testReqId);

      const json = await res.json();
      assert.equal(json.error.code, 'BAD_REQUEST');
      assert.equal(json.error.message, 'Malformed JSON body');
      assert.equal(json.error.requestId, testReqId);
    });

    it('formats custom AppError into its specific status code and message', async () => {
      const notFoundError = new NotFoundError('QR Code not found');
      const res = formatErrorResponse(notFoundError, testReqId);

      assert.equal(res.status, 404);
      assert.equal(res.headers.get(REQUEST_ID_HEADER), testReqId);

      const json = await res.json();
      assert.equal(json.error.code, 'NOT_FOUND');
      assert.equal(json.error.message, 'QR Code not found');
      assert.equal(json.error.requestId, testReqId);
    });

    it('masks unexpected internal exceptions behind a safe 500 error envelope', async () => {
      // Suppress console.error output during this test to keep test logs clean
      const originalConsoleError = console.error;
      console.error = () => {};

      try {
        const sensitiveError = new Error('Database password leak: mysql://root:secret@db');
        const res = formatErrorResponse(sensitiveError, testReqId);

        assert.equal(res.status, 500);
        assert.equal(res.headers.get(REQUEST_ID_HEADER), testReqId);

        const json = await res.json();
        assert.equal(json.error.code, 'INTERNAL_SERVER_ERROR');
        assert.equal(
          json.error.message,
          'An unexpected error occurred. Please try again later.'
        );
        assert.equal(json.error.requestId, testReqId);
        // Ensure sensitive details are not present anywhere in the returned payload
        assert.equal(JSON.stringify(json).includes('secret'), false);
        assert.equal(json.error.details, undefined);
      } finally {
        console.error = originalConsoleError;
      }
    });
  });

  describe('Group D: Route Handler Pipeline & Integration', () => {
    it('executes the real GET /api/v1/health handler with incoming request ID', async () => {
      const validReqId = 'health-test-request-id-12345';
      const req = new NextRequest('http://localhost:3000/api/v1/health', {
        headers: { [REQUEST_ID_HEADER]: validReqId },
      });

      const res = await healthHandler(req);

      assert.equal(res.status, 200);
      assert.equal(res.headers.get(REQUEST_ID_HEADER), validReqId);

      const json = (await res.json()) as { status: string; timestamp: string; version: string };
      assert.equal(json.status, 'ok');
      assert.equal(json.version, '1.0.0');
      assert.ok(json.timestamp);
    });

    it('catches uncaught handler errors and formats response end-to-end', async () => {
      const originalConsoleError = console.error;
      console.error = () => {};

      try {
        const crashingHandler = createApiHandler(async () => {
          throw new AppError('Custom business failure', 422, 'UNPROCESSABLE_ENTITY');
        });

        const customId = 'e2e-crash-request-id-12345';
        const req = new NextRequest('http://localhost:3000/api/v1/test', {
          headers: { [REQUEST_ID_HEADER]: customId },
        });

        const res = await crashingHandler(req);

        assert.equal(res.status, 422);
        assert.equal(res.headers.get(REQUEST_ID_HEADER), customId);

        const json = (await res.json()) as { error: { code: string; message: string; requestId: string } };
        assert.equal(json.error.code, 'UNPROCESSABLE_ENTITY');
        assert.equal(json.error.message, 'Custom business failure');
        assert.equal(json.error.requestId, customId);
      } finally {
        console.error = originalConsoleError;
      }
    });
  });
});
