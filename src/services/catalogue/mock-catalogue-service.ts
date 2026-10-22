import type { Category } from '../../features/categories/types/category';
import type { Product } from '../../features/products/types/product';
import type { PaginatedProducts, ProductQueryParams } from '../../features/products/types/query';
import {
  getAllCategories,
  getCategoryBySlug as registryGetCategoryBySlug,
} from '../../features/categories/data/category-registry';
import {
  getMockProducts,
  getMockProductById,
  getMockProductBySlug,
} from '../../features/products/data/mock-products';
import {
  applyFilters,
  applySorting,
  applyPagination,
  buildPaginationMeta,
  normalizePaginationParams,
} from './catalogue-helpers';
import type { CatalogueService } from './catalogue-service.interface';

/**
 * Deterministic mock implementation of `CatalogueService`.
 *
 * All data comes from the in-memory fixture datasets. Methods resolve
 * immediately without network I/O so they are safe to use in tests and
 * during local development before a real API is available.
 *
 * A future `HttpCatalogueService` will implement the same interface and can
 * be injected in its place without touching any consumer code.
 */
export class MockCatalogueService implements CatalogueService {
  // -------------------------------------------------------------------------
  // Products
  // -------------------------------------------------------------------------

  async getProducts(params: ProductQueryParams = {}): Promise<PaginatedProducts> {
    const all = getMockProducts();

    // 1. Filter (no mutation – applyFilters returns a new array)
    const filtered = applyFilters(all, params);

    // 2. Sort
    const sorted = applySorting(filtered, params.sortBy);

    // 3. Pagination
    const { page, limit } = normalizePaginationParams(params.page, params.limit);
    const items = applyPagination(sorted, page, limit);
    const pagination = buildPaginationMeta(sorted.length, page, limit);

    return {
      items,
      pagination,
      appliedFilters: params,
    };
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    if (!slug) return undefined;
    return getMockProductBySlug(slug);
  }

  // -------------------------------------------------------------------------
  // Categories
  // -------------------------------------------------------------------------

  async getCategories(): Promise<Category[]> {
    // getAllCategories returns a readonly array; spread to give a mutable copy
    return [...getAllCategories()];
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    if (!slug) return undefined;
    return registryGetCategoryBySlug(slug);
  }

  // -------------------------------------------------------------------------
  // Related products
  // -------------------------------------------------------------------------

  async getRelatedProducts(slug: string): Promise<Product[]> {
    if (!slug) return [];

    const product = getMockProductBySlug(slug);
    if (!product || !product.relatedProductIds || product.relatedProductIds.length === 0) {
      return [];
    }

    const related: Product[] = [];
    for (const id of product.relatedProductIds) {
      const found = getMockProductById(id);
      if (found) related.push(found);
    }
    return related;
  }
}

/**
 * Default mock service instance for isolated testing.
 */
export const mockCatalogueService: CatalogueService = new MockCatalogueService();
