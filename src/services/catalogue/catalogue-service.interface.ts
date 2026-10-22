import type { Category } from '../../features/categories/types/category';
import type { Product } from '../../features/products/types/product';
import type { PaginatedProducts, ProductQueryParams } from '../../features/products/types/query';

/**
 * The canonical interface for the VYRO catalogue service.
 *
 * All methods are asynchronous so a real HTTP adapter can implement this
 * interface without changing any call-site code. The mock implementation
 * resolves immediately; a future REST/GraphQL adapter will resolve over the
 * network.
 *
 * Implementations must never throw for "not found" cases – they return
 * `undefined` instead, keeping control-flow explicit at the call-site.
 */
export interface CatalogueService {
  /**
   * Returns a paginated, filtered, and sorted list of products that match
   * the given query parameters.
   */
  getProducts(params?: ProductQueryParams): Promise<PaginatedProducts>;

  /**
   * Returns the single product matching the given URL slug, or `undefined`
   * if no product exists with that slug.
   */
  getProductBySlug(slug: string): Promise<Product | undefined>;

  /**
   * Returns all top-level categories in display order, with their
   * subcategories nested within.
   */
  getCategories(): Promise<Category[]>;

  /**
   * Returns the single category matching the given slug, or `undefined`
   * if no category exists with that slug.
   */
  getCategoryBySlug(slug: string): Promise<Category | undefined>;

  /**
   * Returns the related products for the product identified by `slug`.
   * Uses `relatedProductIds` on the source product; returns an empty array
   * when the product is not found or has no related products.
   */
  getRelatedProducts(slug: string): Promise<Product[]>;
}
