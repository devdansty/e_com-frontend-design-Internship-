import type { Category } from '../../features/categories/types/category';
import type { Product } from '../../features/products/types/product';
import type { PaginatedProducts, ProductQueryParams } from '../../features/products/types/query';
import { HttpClient, HttpError, type HttpClientConfig } from '../http/http-client';
import {
  mapCategoryDto,
  mapPaginatedProductsDto,
  mapProductDto,
} from './catalogue-mapper';
import type { CatalogueService } from './catalogue-service.interface';

/**
 * Concrete HTTP adapter implementing the canonical `CatalogueService` interface.
 *
 * Connects the frontend to a MERN backend (or REST API) following the contract
 * documented in `docs/API_CONTRACTS.md`.
 *
 * Features:
 * - Completely decoupled from React presentation logic.
 * - Graceful 404 handling: returns `undefined` (or empty arrays) according to the interface contract.
 * - Resilient payload normalization via `catalogue-mapper.ts`.
 * - Configurable base URL and timeout without hardcoded secrets.
 */
export class HttpCatalogueService implements CatalogueService {
  private readonly client: HttpClient;

  constructor(clientOrConfig?: HttpClient | HttpClientConfig) {
    if (clientOrConfig instanceof HttpClient) {
      this.client = clientOrConfig;
    } else {
      this.client = new HttpClient(clientOrConfig);
    }
  }

  /**
   * Returns the underlying HttpClient instance.
   */
  getHttpClient(): HttpClient {
    return this.client;
  }

  /**
   * GET /api/products
   * Fetches paginated, filtered, and sorted products from the backend.
   */
  async getProducts(params: ProductQueryParams = {}): Promise<PaginatedProducts> {
    const raw = await this.client.get<unknown>('/products', {
      params: params as Record<string, unknown>,
    });
    return mapPaginatedProductsDto(raw, params);
  }

  /**
   * GET /api/products/:slug
   * Fetches a single product by slug. Returns `undefined` on 404.
   */
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    if (!slug) return undefined;

    try {
      const raw = await this.client.get<unknown>(`/products/${encodeURIComponent(slug)}`);
      if (!raw) return undefined;
      return mapProductDto(raw);
    } catch (err: unknown) {
      if (err instanceof HttpError && (err.status === 404 || err.code === 'NOT_FOUND')) {
        return undefined;
      }
      throw err;
    }
  }

  /**
   * GET /api/categories
   * Fetches the category tree with nested subcategories.
   */
  async getCategories(): Promise<Category[]> {
    const raw = await this.client.get<unknown>('/categories');
    if (!Array.isArray(raw)) {
      return [];
    }
    return raw.map(mapCategoryDto);
  }

  /**
   * GET /api/categories/:slug
   * Fetches a single category by slug. Returns `undefined` on 404.
   */
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    if (!slug) return undefined;

    try {
      const raw = await this.client.get<unknown>(`/categories/${encodeURIComponent(slug)}`);
      if (!raw) return undefined;
      return mapCategoryDto(raw);
    } catch (err: unknown) {
      if (err instanceof HttpError && (err.status === 404 || err.code === 'NOT_FOUND')) {
        return undefined;
      }
      throw err;
    }
  }

  /**
   * GET /api/products/:slug/related
   * Fetches related products. Returns an empty array on 404 or missing relations.
   */
  async getRelatedProducts(slug: string): Promise<Product[]> {
    if (!slug) return [];

    try {
      const raw = await this.client.get<unknown>(`/products/${encodeURIComponent(slug)}/related`);
      if (!raw) return [];

      if (Array.isArray(raw)) {
        return raw.map(mapProductDto);
      }

      if (typeof raw === 'object' && raw !== null && 'items' in raw && Array.isArray((raw as { items: unknown[] }).items)) {
        return (raw as { items: unknown[] }).items.map(mapProductDto);
      }

      return [];
    } catch (err: unknown) {
      if (err instanceof HttpError && (err.status === 404 || err.code === 'NOT_FOUND')) {
        return [];
      }
      throw err;
    }
  }
}
