import 'server-only';
import { NextResponse } from 'next/server';
import { REQUEST_ID_HEADER } from './request-id';

/**
 * Pagination metadata contract for collection endpoints.
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Standard envelope for paginated collection responses.
 */
export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

/**
 * Constructs a standardized 200 OK JSON response containing the given payload and correlated request ID header.
 *
 * @param data - The payload body (single resource, collection, or state object).
 * @param requestId - Correlated request ID.
 * @param init - Optional additional response configuration.
 */
export function apiSuccess<T>(
  data: T,
  requestId: string,
  init?: ResponseInit
): NextResponse<T> {
  const headers = new Headers(init?.headers);
  headers.set(REQUEST_ID_HEADER, requestId);

  return NextResponse.json(data, {
    ...init,
    status: init?.status ?? 200,
    headers,
  });
}

/**
 * Constructs a standardized 201 Created JSON response containing the created resource and correlated request ID header.
 *
 * @param data - The newly created resource.
 * @param requestId - Correlated request ID.
 * @param init - Optional additional response configuration.
 */
export function apiCreated<T>(
  data: T,
  requestId: string,
  init?: ResponseInit
): NextResponse<T> {
  const headers = new Headers(init?.headers);
  headers.set(REQUEST_ID_HEADER, requestId);

  return NextResponse.json(data, {
    ...init,
    status: 201,
    headers,
  });
}

/**
 * Constructs a standardized 204 No Content response with an empty body and correlated request ID header.
 * Typically used for successful deletions or updates without response payloads.
 *
 * @param requestId - Correlated request ID.
 * @param init - Optional additional response configuration.
 */
export function apiNoContent(
  requestId: string,
  init?: ResponseInit
): NextResponse<null> {
  const headers = new Headers(init?.headers);
  headers.set(REQUEST_ID_HEADER, requestId);

  return new NextResponse(null, {
    ...init,
    status: 204,
    headers,
  });
}

/**
 * Constructs a standardized 200 OK JSON response for paginated list queries.
 *
 * @param items - Array of resource entities.
 * @param pagination - Computed pagination metadata.
 * @param requestId - Correlated request ID.
 * @param init - Optional additional response configuration.
 */
export function apiPaginated<T>(
  items: T[],
  pagination: PaginationMeta,
  requestId: string,
  init?: ResponseInit
): NextResponse<PaginatedData<T>> {
  return apiSuccess(
    {
      items,
      pagination,
    },
    requestId,
    init
  );
}
