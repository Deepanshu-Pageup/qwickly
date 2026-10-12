import { createApiHandler } from '@/server/api/handler';
import { apiSuccess } from '@/server/api/response';

/**
 * Health check response payload contract.
 */
export interface HealthStatusResponse {
  status: 'ok';
  timestamp: string;
  version: string;
}

/**
 * GET /api/v1/health
 *
 * Baseline health check endpoint demonstrating:
 * - /api/v1/ route hierarchy conventions
 * - createApiHandler lifecycle and single-point request ID resolution
 * - Standardized apiSuccess response construction
 */
export const GET = createApiHandler(async (_request, { requestId }) => {
  const payload: HealthStatusResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  };

  return apiSuccess(payload, requestId);
});
