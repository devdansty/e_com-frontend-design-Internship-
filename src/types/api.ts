/**
 * Standardized API envelope, error, and pagination types.
 * Provides strict type discrimination for all client-server interactions.
 */

/**
 * Standard pagination request parameters.
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Metadata accompanying paginated collection responses.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Generic container for paginated result collections.
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

/**
 * Standardized error code identifiers for the API.
 */
export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'OUT_OF_STOCK'
  | 'RATE_LIMITED'
  | 'INTERNAL_SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'NETWORK_ERROR';

/**
 * Detailed validation failure description for an individual field.
 */
export interface ApiValidationError {
  field: string;
  message: string;
  rejectedValue?: unknown;
}

/**
 * Standard error shape returned by API endpoints.
 */
export interface ApiError {
  code: ApiErrorCode | string;
  message: string;
  status: number;
  details?: Record<string, unknown> | ApiValidationError[];
  timestamp?: string;
}

/**
 * Successful API response envelope.
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp?: string;
}

/**
 * Failed API response envelope.
 */
export interface ApiErrorResponse {
  success: false;
  error: ApiError;
  timestamp?: string;
}

/**
 * Discriminated union of possible API responses.
 * Enables exhaustive checks via `response.success`.
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
