import type { Product } from '../../features/products/types/product';
import type { PaginationMeta } from '../../types/api';
import type { ProductQueryParams, ProductSortOption } from '../../features/products/types/query';

// ---------------------------------------------------------------------------
// Effective price helpers
// ---------------------------------------------------------------------------

/**
 * Returns the effective selling price for a product:
 * the sale price when set, otherwise the base price.
 */
export function effectivePrice(product: Product): number {
  return product.salePrice ?? product.price;
}

// ---------------------------------------------------------------------------
// Filter predicates – each is a pure function testable in isolation
// ---------------------------------------------------------------------------

/**
 * Returns `true` when the product's name, shortDescription, or brand
 * contains all tokens of the search string (case-insensitive).
 */
export function matchesSearch(product: Product, search: string): boolean {
  const needle = search.toLowerCase().trim();
  if (!needle) return true;
  const haystack = [product.name, product.shortDescription, product.brand]
    .join(' ')
    .toLowerCase();
  return needle.split(/\s+/).every((token) => haystack.includes(token));
}

/**
 * Returns `true` when the product belongs to the specified category slug.
 */
export function matchesCategory(product: Product, categorySlug: string): boolean {
  if (!categorySlug) return true;
  return product.categorySlug === categorySlug.toLowerCase().trim();
}

/**
 * Returns `true` when the product belongs to the specified subcategory slug.
 */
export function matchesSubcategory(product: Product, subcategorySlug: string): boolean {
  if (!subcategorySlug) return true;
  return product.subcategorySlug === subcategorySlug.toLowerCase().trim();
}

/**
 * Returns `true` when the product's effective price is within [min, max].
 * Undefined bounds are treated as open-ended.
 */
export function matchesPriceRange(
  product: Product,
  minPrice: number | undefined,
  maxPrice: number | undefined,
): boolean {
  const price = effectivePrice(product);
  if (minPrice !== undefined && price < minPrice) return false;
  if (maxPrice !== undefined && price > maxPrice) return false;
  return true;
}

/**
 * Returns `true` when the product's stock status is in the allowed set.
 * Also used when `inStockOnly` is requested (matches 'in_stock' | 'low_stock').
 */
export function matchesStockStatus(
  product: Product,
  stockStatus: ProductQueryParams['stockStatus'],
  inStockOnly: boolean | undefined,
): boolean {
  if (inStockOnly) {
    return product.stockStatus === 'in_stock' || product.stockStatus === 'low_stock';
  }
  if (!stockStatus) return true;
  const allowed = Array.isArray(stockStatus) ? stockStatus : [stockStatus];
  return allowed.includes(product.stockStatus);
}

/**
 * Returns `true` when the product carries all of the requested badges.
 */
export function matchesBadges(
  product: Product,
  badges: ProductQueryParams['badges'],
): boolean {
  if (!badges || badges.length === 0) return true;
  if (!product.badges || product.badges.length === 0) return false;
  return badges.every((b) => product.badges!.includes(b));
}

/**
 * Returns `true` when isFeatured filter is not set, or matches the product flag.
 */
export function matchesFeatured(
  product: Product,
  isFeatured: boolean | undefined,
): boolean {
  if (isFeatured === undefined) return true;
  return (product.isFeatured ?? false) === isFeatured;
}

// ---------------------------------------------------------------------------
// Sorting comparator
// ---------------------------------------------------------------------------

/**
 * Returns a comparator function for the requested sort option.
 * All comparators are stable (equal elements retain relative order).
 */
export function buildSortComparator(
  sortBy: ProductSortOption,
): (a: Product, b: Product) => number {
  switch (sortBy) {
    case 'price_asc':
      return (a, b) => effectivePrice(a) - effectivePrice(b);
    case 'price_desc':
      return (a, b) => effectivePrice(b) - effectivePrice(a);
    case 'rating_desc':
      return (a, b) => (b.rating ?? 0) - (a.rating ?? 0);
    case 'name_asc':
      return (a, b) => a.name.localeCompare(b.name);
    case 'name_desc':
      return (a, b) => b.name.localeCompare(a.name);
    case 'newest':
      return (a, b) => {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tB - tA;
      };
    case 'featured':
    default:
      // Featured products first, then by descending rating as tiebreaker
      return (a, b) => {
        const featA = a.isFeatured ? 1 : 0;
        const featB = b.isFeatured ? 1 : 0;
        if (featB !== featA) return featB - featA;
        return (b.rating ?? 0) - (a.rating ?? 0);
      };
  }
}

// ---------------------------------------------------------------------------
// Apply all filters in one pass
// ---------------------------------------------------------------------------

/**
 * Applies all active filters from `params` to `products`.
 * Returns a new array – the original dataset is never mutated.
 */
export function applyFilters(
  products: readonly Product[],
  params: ProductQueryParams,
): Product[] {
  return products.filter((p) => {
    if (params.search && !matchesSearch(p, params.search)) return false;
    if (params.categorySlug && !matchesCategory(p, params.categorySlug)) return false;
    if (params.subcategorySlug && !matchesSubcategory(p, params.subcategorySlug)) return false;
    if (!matchesPriceRange(p, params.minPrice, params.maxPrice)) return false;
    if (!matchesStockStatus(p, params.stockStatus, params.inStockOnly)) return false;
    if (!matchesBadges(p, params.badges)) return false;
    if (!matchesFeatured(p, params.isFeatured)) return false;
    return true;
  });
}

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

/**
 * Returns a new sorted array without mutating the input.
 * Defaults to the 'featured' sort when no sort option is supplied.
 */
export function applySorting(
  products: Product[],
  sortBy: ProductSortOption | undefined,
): Product[] {
  const comparator = buildSortComparator(sortBy ?? 'featured');
  return [...products].sort(comparator);
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

/**
 * Clamps a requested page/limit to sane, predictable values.
 */
export function normalizePaginationParams(
  page: number | undefined,
  limit: number | undefined,
): { page: number; limit: number } {
  const p = Math.max(1, Math.floor(page ?? DEFAULT_PAGE));
  const l = Math.min(MAX_LIMIT, Math.max(1, Math.floor(limit ?? DEFAULT_LIMIT)));
  return { page: p, limit: l };
}

/**
 * Computes a fully populated `PaginationMeta` record.
 */
export function buildPaginationMeta(
  totalItems: number,
  page: number,
  limit: number,
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Slices the sorted array to the requested page window.
 * Returns a new array.
 */
export function applyPagination<T>(items: T[], page: number, limit: number): T[] {
  const start = (page - 1) * limit;
  return items.slice(start, start + limit);
}
