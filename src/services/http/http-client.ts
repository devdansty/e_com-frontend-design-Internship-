import type { ApiErrorCode, ApiErrorResponse, ApiResponse, ApiSuccessResponse } from '../../types/api';

/**
 * Configuration options for the typed HttpClient.
 */
export interface HttpClientConfig {
  /**
   * Base URL for all relative request paths.
   * e.g., 'http://localhost:5000/api' or '/api'.
   * Trailing slashes are automatically trimmed.
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds. Defaults to 10,000ms (10 seconds).
   */
  timeoutMs?: number;

  /**
   * Default headers merged into every request.
   */
  defaultHeaders?: Record<string, string>;

  /**
   * Custom fetch function (useful for tests or node environments).
   * Defaults to global `fetch`.
   */
  fetchFn?: typeof fetch;
}

/**
 * Options for individual HTTP requests.
 */
export interface HttpRequestOptions {
  /**
   * Key-value query parameters serialized onto the request URL.
   */
  params?: Record<string, unknown>;

  /**
   * Additional HTTP headers.
   */
  headers?: Record<string, string>;

  /**
   * Optional custom timeout for this specific request.
   */
  timeoutMs?: number;

  /**
   * Optional AbortSignal to cancel the request.
   */
  signal?: AbortSignal;
}

/**
 * Standardized typed HTTP error representing client, network, or server failures.
 */
export class HttpError extends Error {
  /**
   * HTTP status code (e.g. 404, 500, or 0 for network/timeout errors).
   */
  readonly status: number;

  /**
   * Standardized application error code.
   */
  readonly code: ApiErrorCode | string;

  /**
   * Detailed error payload or validation failures if provided by the backend.
   */
  readonly details?: unknown;

  /**
   * True when the failure was caused by a network disconnection or DNS failure.
   */
  readonly isNetworkError: boolean;

  /**
   * True when the request exceeded the timeout threshold.
   */
  readonly isTimeout: boolean;

  /**
   * The parsed error response envelope if available.
   */
  readonly rawResponse?: ApiResponse<unknown>;

  constructor(options: {
    message: string;
    status: number;
    code?: ApiErrorCode | string;
    details?: unknown;
    isNetworkError?: boolean;
    isTimeout?: boolean;
    rawResponse?: ApiResponse<unknown>;
  }) {
    super(options.message);
    this.name = 'HttpError';
    this.status = options.status;
    this.code = options.code ?? (options.status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
    this.details = options.details;
    this.isNetworkError = options.isNetworkError ?? false;
    this.isTimeout = options.isTimeout ?? false;
    this.rawResponse = options.rawResponse;

    // Restore prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Serializes query parameters into a URL query string.
 * - Omits undefined, null, and empty string values.
 * - Formats arrays as comma-separated values (e.g. `badges=bestseller,sale`).
 * - Formats booleans as `'true'` or `'false'`.
 */
export function serializeQueryParams(params?: Record<string, unknown>): string {
  if (!params) return '';

  const entries: string[] = [];

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      const encoded = value.map((v) => encodeURIComponent(String(v))).join(',');
      entries.push(`${encodeURIComponent(key)}=${encoded}`);
    } else {
      entries.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }

  return entries.length > 0 ? `?${entries.join('&')}` : '';
}

/**
 * Reusable, typed HTTP client wrapper.
 * Completely decoupled from React presentation logic and components.
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly defaultHeaders: Record<string, string>;
  private readonly fetchFn: typeof fetch;

  constructor(config: HttpClientConfig = {}) {
    const rawBaseUrl = config.baseUrl ?? '/api';
    this.baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
    this.timeoutMs = config.timeoutMs ?? 10000;
    this.defaultHeaders = {
      Accept: 'application/json',
      ...config.defaultHeaders,
    };
    this.fetchFn = config.fetchFn ?? globalThis.fetch?.bind(globalThis);
  }

  /**
   * Returns the configured base URL.
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Resolves a relative or absolute URL against the base URL.
   */
  resolveUrl(path: string, params?: Record<string, unknown>): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const base = this.baseUrl.startsWith('http://') || this.baseUrl.startsWith('https://')
      ? `${this.baseUrl}${cleanPath}`
      : `${this.baseUrl}${cleanPath}`;
    const queryString = serializeQueryParams(params);
    return `${base}${queryString}`;
  }

  /**
   * Executes an HTTP GET request and returns the deserialized data payload.
   * If the backend wraps responses in `{ success: true, data: T }`, the `data`
   * payload is automatically unwrapped.
   */
  async get<T>(path: string, options: HttpRequestOptions = {}): Promise<T> {
    return this.request<T>('GET', path, options);
  }

  /**
   * Core request dispatcher with timeout and standardized error handling.
   */
  async request<T>(
    method: string,
    path: string,
    options: HttpRequestOptions = {},
  ): Promise<T> {
    if (!this.fetchFn) {
      throw new HttpError({
        message: 'No fetch implementation available in current environment',
        status: 0,
        code: 'NETWORK_ERROR',
        isNetworkError: true,
      });
    }

    const url = this.resolveUrl(path, options.params);
    const timeoutMs = options.timeoutMs ?? this.timeoutMs;
    const controller = new AbortController();

    // If already aborted, fail immediately without dispatching request
    if (options.signal?.aborted) {
      throw new HttpError({
        message: 'Request was cancelled',
        status: 0,
        code: 'NETWORK_ERROR',
      });
    }

    // Link caller signal if provided
    let callerAbortListener: (() => void) | undefined;
    if (options.signal) {
      callerAbortListener = () => controller.abort();
      options.signal.addEventListener('abort', callerAbortListener);
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let timedOut = false;

    if (timeoutMs > 0) {
      timeoutId = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, timeoutMs);
    }

    try {
      const response = await this.fetchFn(url, {
        method,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      });

      // Parse JSON body if present
      let responseBody: unknown;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          responseBody = await response.json();
        } catch {
          responseBody = undefined;
        }
      } else {
        // Attempt text fallback if needed
        try {
          const text = await response.text();
          responseBody = text.trim() ? text : undefined;
        } catch {
          responseBody = undefined;
        }
      }

      // Handle HTTP error responses
      if (!response.ok) {
        const errorEnvelope = responseBody as ApiErrorResponse | undefined;
        const errorData = errorEnvelope?.error;

        const fallbackCode: ApiErrorCode =
          response.status === 404
            ? 'NOT_FOUND'
            : response.status >= 500
              ? 'INTERNAL_SERVER_ERROR'
              : 'BAD_REQUEST';

        throw new HttpError({
          message:
            errorData?.message ??
            `HTTP ${response.status}: ${response.statusText || 'Request failed'}`,
          status: response.status,
          code: errorData?.code ?? fallbackCode,
          details: errorData?.details,
          rawResponse: errorEnvelope,
        });
      }

      // Handle successful response
      // Unwrap standard ApiSuccessResponse envelope if present
      const successEnvelope = responseBody as ApiSuccessResponse<T> | undefined;
      if (
        successEnvelope &&
        typeof successEnvelope === 'object' &&
        'success' in successEnvelope &&
        successEnvelope.success === true &&
        'data' in successEnvelope
      ) {
        return successEnvelope.data;
      }

      // Otherwise return body directly
      return responseBody as T;
    } catch (err: unknown) {
      if (err instanceof HttpError) {
        throw err;
      }

      if (timedOut) {
        throw new HttpError({
          message: `Request timed out after ${timeoutMs}ms`,
          status: 0,
          code: 'SERVICE_UNAVAILABLE',
          isTimeout: true,
        });
      }

      const isAbort = (err as Error)?.name === 'AbortError';
      if (isAbort && !timedOut) {
        throw new HttpError({
          message: 'Request was cancelled',
          status: 0,
          code: 'NETWORK_ERROR',
        });
      }

      // General network/fetch failure
      const errorMessage = err instanceof Error ? err.message : 'Network request failed';
      throw new HttpError({
        message: `Network error: ${errorMessage}`,
        status: 0,
        code: 'NETWORK_ERROR',
        isNetworkError: true,
      });
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (options.signal && callerAbortListener) {
        options.signal.removeEventListener('abort', callerAbortListener);
      }
    }
  }
}
