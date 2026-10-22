import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpClient, HttpError, serializeQueryParams } from './http-client';

describe('serializeQueryParams', () => {
  it('returns empty string for undefined or empty params', () => {
    expect(serializeQueryParams(undefined)).toBe('');
    expect(serializeQueryParams({})).toBe('');
  });

  it('omits undefined, null, and empty string properties', () => {
    const result = serializeQueryParams({
      a: 'hello',
      b: undefined,
      c: null,
      d: '',
    });
    expect(result).toBe('?a=hello');
  });

  it('serializes numbers, booleans, and strings', () => {
    const result = serializeQueryParams({
      page: 2,
      limit: 10,
      inStockOnly: true,
      search: 'anc earbuds',
    });
    expect(result).toBe('?page=2&limit=10&inStockOnly=true&search=anc%20earbuds');
  });

  it('serializes arrays as comma-separated values', () => {
    const result = serializeQueryParams({
      badges: ['bestseller', 'sale'],
      categories: ['audio', 'gaming'],
    });
    expect(result).toBe('?badges=bestseller,sale&categories=audio,gaming');
  });

  it('omits empty arrays', () => {
    const result = serializeQueryParams({
      empty: [],
      valid: 'yes',
    });
    expect(result).toBe('?valid=yes');
  });
});

describe('HttpClient', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
  });

  it('trims trailing slashes from baseUrl', () => {
    const client = new HttpClient({ baseUrl: 'http://localhost:5000/api/' });
    expect(client.getBaseUrl()).toBe('http://localhost:5000/api');
  });

  it('defaults baseUrl to /api', () => {
    const client = new HttpClient();
    expect(client.getBaseUrl()).toBe('/api');
  });

  it('resolves URLs with query parameters correctly', () => {
    const client = new HttpClient({ baseUrl: 'http://localhost:5000/api' });
    const url = client.resolveUrl('/products', { page: 1, search: 'test' });
    expect(url).toBe('http://localhost:5000/api/products?page=1&search=test');
  });

  it('unwraps ApiSuccessResponse envelope { success: true, data }', async () => {
    const mockData = { id: 'prod-1', name: 'VYRO Audio' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: true,
        data: mockData,
        timestamp: '2026-10-25T01:00:00Z',
      }),
    });

    const client = new HttpClient({
      baseUrl: 'http://localhost:5000/api',
      fetchFn: mockFetch as unknown as typeof fetch,
    });

    const result = await client.get<typeof mockData>('/products/prod-1');
    expect(result).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/products/prod-1',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Accept: 'application/json' }),
      }),
    );
  });

  it('returns raw JSON payload when not wrapped in ApiSuccessResponse envelope', async () => {
    const mockList = [{ id: '1' }, { id: '2' }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockList,
    });

    const client = new HttpClient({
      baseUrl: '/api',
      fetchFn: mockFetch as unknown as typeof fetch,
    });

    const result = await client.get('/items');
    expect(result).toEqual(mockList);
  });

  it('throws HttpError with parsed error details on 404 ApiErrorResponse', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Product with slug not-found was not found',
          status: 404,
        },
      }),
    });

    const client = new HttpClient({
      fetchFn: mockFetch as unknown as typeof fetch,
    });

    try {
      await client.get('/products/not-found');
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(HttpError);
      const httpErr = err as HttpError;
      expect(httpErr.status).toBe(404);
      expect(httpErr.code).toBe('NOT_FOUND');
      expect(httpErr.message).toBe('Product with slug not-found was not found');
      expect(httpErr.isNetworkError).toBe(false);
    }
  });

  it('handles non-JSON error responses gracefully (e.g. 502 Bad Gateway text)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      headers: new Headers({ 'content-type': 'text/plain' }),
      text: async () => '502 Bad Gateway proxy failure',
    });

    const client = new HttpClient({
      fetchFn: mockFetch as unknown as typeof fetch,
    });

    try {
      await client.get('/products');
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(HttpError);
      const httpErr = err as HttpError;
      expect(httpErr.status).toBe(502);
      expect(httpErr.code).toBe('INTERNAL_SERVER_ERROR');
      expect(httpErr.message).toBe('HTTP 502: Bad Gateway');
    }
  });

  it('translates network disconnection/fetch reject into HttpError with NETWORK_ERROR', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const client = new HttpClient({
      fetchFn: mockFetch as unknown as typeof fetch,
    });

    try {
      await client.get('/products');
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(HttpError);
      const httpErr = err as HttpError;
      expect(httpErr.isNetworkError).toBe(true);
      expect(httpErr.code).toBe('NETWORK_ERROR');
      expect(httpErr.status).toBe(0);
      expect(httpErr.message).toContain('Failed to fetch');
    }
  });

  it('translates timeout into HttpError with SERVICE_UNAVAILABLE and isTimeout true', async () => {
    vi.useFakeTimers();

    // Mock fetch that hangs until aborted
    mockFetch.mockImplementation(
      (_url: string, init: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener('abort', () => {
            const abortErr = new Error('The operation was aborted');
            abortErr.name = 'AbortError';
            reject(abortErr);
          });
        }),
    );

    const client = new HttpClient({
      timeoutMs: 50,
      fetchFn: mockFetch as unknown as typeof fetch,
    });

    const promise = client.get('/slow-endpoint');

    vi.advanceTimersByTime(100);

    await expect(promise).rejects.toThrowError(HttpError);

    try {
      await promise;
    } catch (err) {
      const httpErr = err as HttpError;
      expect(httpErr.isTimeout).toBe(true);
      expect(httpErr.code).toBe('SERVICE_UNAVAILABLE');
    }

    vi.useRealTimers();
  });

  it('rejects immediately when caller signal is pre-aborted', async () => {
    const controller = new AbortController();
    controller.abort();

    const client = new HttpClient({
      fetchFn: mockFetch as unknown as typeof fetch,
    });

    await expect(client.get('/cancelled', { signal: controller.signal })).rejects.toThrowError(
      'Request was cancelled',
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('aborts active request when caller aborts in-flight', async () => {
    const controller = new AbortController();

    mockFetch.mockImplementation(
      (_url: string, init: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener('abort', () => {
            const abortErr = new Error('The operation was aborted');
            abortErr.name = 'AbortError';
            reject(abortErr);
          });
        }),
    );

    const client = new HttpClient({
      fetchFn: mockFetch as unknown as typeof fetch,
    });

    const promise = client.get('/in-flight', { signal: controller.signal });
    controller.abort();

    await expect(promise).rejects.toThrowError('Request was cancelled');
  });
});
