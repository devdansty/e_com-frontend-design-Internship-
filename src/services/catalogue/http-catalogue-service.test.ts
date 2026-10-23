import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpCatalogueService } from './http-catalogue-service';
import { HttpClient, HttpError } from '../http/http-client';
import type { CatalogueService } from './catalogue-service.interface';

describe('HttpCatalogueService', () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let service: HttpCatalogueService;

  beforeEach(() => {
    mockFetch = vi.fn();
    const client = new HttpClient({
      baseUrl: 'http://localhost:5000/api',
      fetchFn: mockFetch as unknown as typeof fetch,
    });
    service = new HttpCatalogueService(client);
  });

  it('satisfies the CatalogueService interface', () => {
    const isCatalogueService: CatalogueService = service;
    expect(isCatalogueService).toBeDefined();
    expect(typeof isCatalogueService.getProducts).toBe('function');
    expect(typeof isCatalogueService.getProductBySlug).toBe('function');
    expect(typeof isCatalogueService.getCategories).toBe('function');
    expect(typeof isCatalogueService.getCategoryBySlug).toBe('function');
    expect(typeof isCatalogueService.getRelatedProducts).toBe('function');
  });

  describe('getProducts', () => {
    it('dispatches GET to /products with query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: {
            items: [
              {
                id: 'prod-pulse',
                name: 'VYRO Pulse ANC',
                price: 12999,
                categorySlug: 'audio-sound',
              },
            ],
            pagination: {
              page: 1,
              limit: 12,
              totalItems: 1,
              totalPages: 1,
              hasNextPage: false,
              hasPrevPage: false,
            },
          },
        }),
      });

      const result = await service.getProducts({
        categorySlug: 'audio-sound',
        minPrice: 5000,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/products?categorySlug=audio-sound&minPrice=5000',
        expect.anything(),
      );
      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('prod-pulse');
      expect(result.pagination.totalItems).toBe(1);
    });
  });

  describe('getProductBySlug', () => {
    it('returns mapped Product for an existing slug', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: {
            id: 'prod-pulse',
            slug: 'vyro-pulse-earbuds',
            name: 'VYRO Pulse',
            price: 12999,
          },
        }),
      });

      const product = await service.getProductBySlug('vyro-pulse-earbuds');
      expect(product).toBeDefined();
      expect(product?.id).toBe('prod-pulse');
      expect(product?.slug).toBe('vyro-pulse-earbuds');
    });

    it('returns undefined when server returns 404 Not Found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Product not found',
            status: 404,
          },
        }),
      });

      const product = await service.getProductBySlug('non-existent-slug');
      expect(product).toBeUndefined();
    });

    it('returns undefined when slug is empty string', async () => {
      const product = await service.getProductBySlug('');
      expect(product).toBeUndefined();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('re-throws 500 Internal Server Error as HttpError', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database connection failed',
            status: 500,
          },
        }),
      });

      await expect(service.getProductBySlug('crash-slug')).rejects.toThrowError(HttpError);
    });
  });

  describe('getCategories', () => {
    it('returns mapped category array on 200 OK', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: [
            {
              id: 'cat-audio',
              slug: 'audio-sound',
              name: 'Audio & Sound',
              subcategories: [
                {
                  id: 'sub-earbuds',
                  slug: 'wireless-earbuds',
                  name: 'Wireless Earbuds',
                },
              ],
            },
          ],
        }),
      });

      const categories = await service.getCategories();
      expect(categories).toHaveLength(1);
      expect(categories[0].id).toBe('cat-audio');
      expect(categories[0].subcategories).toHaveLength(1);
    });

    it('returns empty array when response data is not an array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: null,
        }),
      });

      const categories = await service.getCategories();
      expect(categories).toEqual([]);
    });
  });

  describe('getCategoryBySlug', () => {
    it('returns category for an existing slug', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: {
            id: 'cat-gaming',
            slug: 'gaming',
            name: 'Gaming',
          },
        }),
      });

      const category = await service.getCategoryBySlug('gaming');
      expect(category).toBeDefined();
      expect(category?.slug).toBe('gaming');
    });

    it('returns undefined when category returns 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Category not found', status: 404 },
        }),
      });

      const category = await service.getCategoryBySlug('unknown-cat');
      expect(category).toBeUndefined();
    });

    it('returns undefined for empty slug', async () => {
      const category = await service.getCategoryBySlug('');
      expect(category).toBeUndefined();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('getRelatedProducts', () => {
    it('returns related products array on 200 OK', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: [
            { id: 'rel-1', name: 'Related Item 1', price: 3000 },
            { id: 'rel-2', name: 'Related Item 2', price: 4500 },
          ],
        }),
      });

      const related = await service.getRelatedProducts('source-product');
      expect(related).toHaveLength(2);
      expect(related[0].id).toBe('rel-1');
    });

    it('returns empty array when endpoint returns 404 (product not found)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Not found', status: 404 },
        }),
      });

      const related = await service.getRelatedProducts('unknown-product');
      expect(related).toEqual([]);
    });

    it('returns empty array for empty slug', async () => {
      const related = await service.getRelatedProducts('');
      expect(related).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
