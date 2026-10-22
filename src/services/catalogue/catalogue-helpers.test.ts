import { describe, it, expect } from 'vitest';
import type { Product } from '../../features/products/types/product';
import {
  effectivePrice,
  matchesSearch,
  matchesCategory,
  matchesSubcategory,
  matchesPriceRange,
  matchesStockStatus,
  matchesBadges,
  matchesFeatured,
  applyFilters,
  applySorting,
  applyPagination,
  buildPaginationMeta,
  normalizePaginationParams,
} from './catalogue-helpers';
import { MOCK_PRODUCTS } from '../../features/products/data/mock-products';

// ---------------------------------------------------------------------------
// Minimal stub factory – only the fields exercised by helpers
// ---------------------------------------------------------------------------
function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'test-id',
    slug: 'test-slug',
    name: 'Test Product',
    shortDescription: 'A short description',
    description: 'A long description',
    price: 10000,
    currency: 'PKR',
    brand: 'VYRO',
    categorySlug: 'audio-sound',
    subcategorySlug: 'wireless-earbuds',
    primaryImage: { id: 'img-1', url: '/test.svg', altText: 'test', isPrimary: true },
    features: ['Feature A'],
    specifications: [{ name: 'Driver', value: '10mm' }],
    stockStatus: 'in_stock',
    ...overrides,
  };
}

// ===========================================================================
// effectivePrice
// ===========================================================================
describe('effectivePrice', () => {
  it('returns salePrice when set', () => {
    expect(effectivePrice(makeProduct({ price: 10000, salePrice: 7500 }))).toBe(7500);
  });

  it('falls back to price when salePrice is absent', () => {
    expect(effectivePrice(makeProduct({ price: 10000 }))).toBe(10000);
  });
});

// ===========================================================================
// matchesSearch
// ===========================================================================
describe('matchesSearch', () => {
  const product = makeProduct({ name: 'Wireless ANC Earbuds', brand: 'VYRO', shortDescription: 'Amazing sound' });

  it('matches single token in name', () => {
    expect(matchesSearch(product, 'ANC')).toBe(true);
  });

  it('matches token in shortDescription', () => {
    expect(matchesSearch(product, 'amazing')).toBe(true);
  });

  it('matches token in brand', () => {
    expect(matchesSearch(product, 'vyro')).toBe(true);
  });

  it('matches multiple tokens all present across haystack', () => {
    expect(matchesSearch(product, 'wireless sound')).toBe(true);
  });

  it('rejects when any token is missing', () => {
    expect(matchesSearch(product, 'wireless bluetooth')).toBe(false);
  });

  it('returns true for empty search string', () => {
    expect(matchesSearch(product, '')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(matchesSearch(product, 'EARBUDS')).toBe(true);
  });
});

// ===========================================================================
// matchesCategory
// ===========================================================================
describe('matchesCategory', () => {
  const product = makeProduct({ categorySlug: 'gaming' });

  it('matches exact category slug', () => {
    expect(matchesCategory(product, 'gaming')).toBe(true);
  });

  it('rejects different category slug', () => {
    expect(matchesCategory(product, 'wearables')).toBe(false);
  });

  it('returns true for empty slug (no filter)', () => {
    expect(matchesCategory(product, '')).toBe(true);
  });

  it('normalises casing on input slug', () => {
    expect(matchesCategory(product, 'GAMING')).toBe(true);
  });
});

// ===========================================================================
// matchesSubcategory
// ===========================================================================
describe('matchesSubcategory', () => {
  const product = makeProduct({ subcategorySlug: 'controllers' });

  it('matches exact subcategory slug', () => {
    expect(matchesSubcategory(product, 'controllers')).toBe(true);
  });

  it('rejects wrong subcategory slug', () => {
    expect(matchesSubcategory(product, 'gaming-headsets')).toBe(false);
  });

  it('returns true for empty slug (no filter)', () => {
    expect(matchesSubcategory(product, '')).toBe(true);
  });
});

// ===========================================================================
// matchesPriceRange
// ===========================================================================
describe('matchesPriceRange', () => {
  const product = makeProduct({ price: 10000, salePrice: 8000 });

  it('uses effective price (salePrice) for comparison', () => {
    // effective price is 8000; range [7000, 9000] should match
    expect(matchesPriceRange(product, 7000, 9000)).toBe(true);
  });

  it('rejects when effective price is below minPrice', () => {
    expect(matchesPriceRange(product, 9000, undefined)).toBe(false);
  });

  it('rejects when effective price is above maxPrice', () => {
    expect(matchesPriceRange(product, undefined, 7000)).toBe(false);
  });

  it('accepts open lower bound', () => {
    expect(matchesPriceRange(product, undefined, 10000)).toBe(true);
  });

  it('accepts open upper bound', () => {
    expect(matchesPriceRange(product, 5000, undefined)).toBe(true);
  });

  it('accepts both bounds undefined (no range filter)', () => {
    expect(matchesPriceRange(product, undefined, undefined)).toBe(true);
  });

  it('matches at the exact boundary values', () => {
    expect(matchesPriceRange(product, 8000, 8000)).toBe(true);
  });
});

// ===========================================================================
// matchesStockStatus
// ===========================================================================
describe('matchesStockStatus', () => {
  const inStock = makeProduct({ stockStatus: 'in_stock' });
  const lowStock = makeProduct({ stockStatus: 'low_stock' });
  const outOfStock = makeProduct({ stockStatus: 'out_of_stock' });

  it('inStockOnly accepts in_stock products', () => {
    expect(matchesStockStatus(inStock, undefined, true)).toBe(true);
  });

  it('inStockOnly accepts low_stock products', () => {
    expect(matchesStockStatus(lowStock, undefined, true)).toBe(true);
  });

  it('inStockOnly rejects out_of_stock products', () => {
    expect(matchesStockStatus(outOfStock, undefined, true)).toBe(false);
  });

  it('filters by single status string', () => {
    expect(matchesStockStatus(lowStock, 'low_stock', undefined)).toBe(true);
    expect(matchesStockStatus(inStock, 'low_stock', undefined)).toBe(false);
  });

  it('filters by array of statuses', () => {
    expect(matchesStockStatus(outOfStock, ['out_of_stock', 'preorder'], undefined)).toBe(true);
    expect(matchesStockStatus(inStock, ['out_of_stock', 'preorder'], undefined)).toBe(false);
  });

  it('passes when no status filter is set', () => {
    expect(matchesStockStatus(outOfStock, undefined, undefined)).toBe(true);
  });
});

// ===========================================================================
// matchesBadges
// ===========================================================================
describe('matchesBadges', () => {
  const product = makeProduct({ badges: ['bestseller', 'sale'] });
  const noBadges = makeProduct({ badges: undefined });

  it('passes when no badge filter is requested', () => {
    expect(matchesBadges(product, [])).toBe(true);
    expect(matchesBadges(product, undefined)).toBe(true);
  });

  it('matches when product has all requested badges', () => {
    expect(matchesBadges(product, ['bestseller'])).toBe(true);
    expect(matchesBadges(product, ['bestseller', 'sale'])).toBe(true);
  });

  it('rejects when product is missing any requested badge', () => {
    expect(matchesBadges(product, ['bestseller', 'new'])).toBe(false);
  });

  it('rejects when product has no badges at all', () => {
    expect(matchesBadges(noBadges, ['bestseller'])).toBe(false);
  });
});

// ===========================================================================
// matchesFeatured
// ===========================================================================
describe('matchesFeatured', () => {
  const featured = makeProduct({ isFeatured: true });
  const notFeatured = makeProduct({ isFeatured: false });
  const unset = makeProduct({ isFeatured: undefined });

  it('passes when isFeatured filter is undefined', () => {
    expect(matchesFeatured(featured, undefined)).toBe(true);
    expect(matchesFeatured(notFeatured, undefined)).toBe(true);
  });

  it('filters to only featured products when filter is true', () => {
    expect(matchesFeatured(featured, true)).toBe(true);
    expect(matchesFeatured(notFeatured, true)).toBe(false);
    expect(matchesFeatured(unset, true)).toBe(false);
  });

  it('filters to only non-featured products when filter is false', () => {
    expect(matchesFeatured(notFeatured, false)).toBe(true);
    expect(matchesFeatured(featured, false)).toBe(false);
  });
});

// ===========================================================================
// applyFilters (composite)
// ===========================================================================
describe('applyFilters', () => {
  it('returns all products when params are empty', () => {
    const result = applyFilters(MOCK_PRODUCTS, {});
    expect(result).toHaveLength(MOCK_PRODUCTS.length);
  });

  it('does not mutate the source array', () => {
    const original = [...MOCK_PRODUCTS];
    applyFilters(MOCK_PRODUCTS, { categorySlug: 'gaming' });
    expect([...MOCK_PRODUCTS]).toEqual(original);
  });

  it('filters by categorySlug', () => {
    const result = applyFilters(MOCK_PRODUCTS, { categorySlug: 'gaming' });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.categorySlug === 'gaming')).toBe(true);
  });

  it('filters by categorySlug + subcategorySlug', () => {
    const result = applyFilters(MOCK_PRODUCTS, {
      categorySlug: 'audio-sound',
      subcategorySlug: 'wireless-earbuds',
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.subcategorySlug === 'wireless-earbuds')).toBe(true);
  });

  it('filters by price range', () => {
    const result = applyFilters(MOCK_PRODUCTS, { minPrice: 1, maxPrice: 5000 });
    expect(result.every((p) => (p.salePrice ?? p.price) <= 5000)).toBe(true);
  });

  it('filters by search term across real products', () => {
    const result = applyFilters(MOCK_PRODUCTS, { search: 'GaN' });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) =>
      [p.name, p.shortDescription, p.brand].join(' ').toLowerCase().includes('gan'),
    )).toBe(true);
  });

  it('returns empty array when no products match', () => {
    const result = applyFilters(MOCK_PRODUCTS, { search: 'zzzzz_nonexistent_token' });
    expect(result).toHaveLength(0);
  });

  it('filters by inStockOnly', () => {
    const result = applyFilters(MOCK_PRODUCTS, { inStockOnly: true });
    expect(result.every(
      (p) => p.stockStatus === 'in_stock' || p.stockStatus === 'low_stock',
    )).toBe(true);
  });

  it('filters by isFeatured', () => {
    const result = applyFilters(MOCK_PRODUCTS, { isFeatured: true });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.isFeatured === true)).toBe(true);
  });
});

// ===========================================================================
// buildSortComparator and applySorting
// ===========================================================================
describe('applySorting', () => {
  it('sorts price_asc by effective price ascending', () => {
    const sorted = applySorting([...MOCK_PRODUCTS], 'price_asc');
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1].salePrice ?? sorted[i - 1].price;
      const curr = sorted[i].salePrice ?? sorted[i].price;
      expect(prev).toBeLessThanOrEqual(curr);
    }
  });

  it('sorts price_desc by effective price descending', () => {
    const sorted = applySorting([...MOCK_PRODUCTS], 'price_desc');
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1].salePrice ?? sorted[i - 1].price;
      const curr = sorted[i].salePrice ?? sorted[i].price;
      expect(prev).toBeGreaterThanOrEqual(curr);
    }
  });

  it('sorts rating_desc with highest ratings first', () => {
    const sorted = applySorting([...MOCK_PRODUCTS], 'rating_desc');
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].rating ?? 0).toBeGreaterThanOrEqual(sorted[i].rating ?? 0);
    }
  });

  it('sorts name_asc alphabetically', () => {
    const sorted = applySorting([...MOCK_PRODUCTS], 'name_asc');
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].name.localeCompare(sorted[i].name)).toBeLessThanOrEqual(0);
    }
  });

  it('sorts name_desc reverse-alphabetically', () => {
    const sorted = applySorting([...MOCK_PRODUCTS], 'name_desc');
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].name.localeCompare(sorted[i].name)).toBeGreaterThanOrEqual(0);
    }
  });

  it('sorts newest with most recent createdAt first', () => {
    const sorted = applySorting([...MOCK_PRODUCTS], 'newest');
    for (let i = 1; i < sorted.length; i++) {
      const tA = sorted[i - 1].createdAt ? new Date(sorted[i - 1].createdAt!).getTime() : 0;
      const tB = sorted[i].createdAt ? new Date(sorted[i].createdAt!).getTime() : 0;
      expect(tA).toBeGreaterThanOrEqual(tB);
    }
  });

  it('sorts featured with isFeatured products first', () => {
    const sorted = applySorting([...MOCK_PRODUCTS], 'featured');
    const firstNonFeaturedIdx = sorted.findIndex((p) => !p.isFeatured);
    if (firstNonFeaturedIdx !== -1) {
      expect(sorted.slice(0, firstNonFeaturedIdx).every((p) => p.isFeatured)).toBe(true);
    }
  });

  it('does not mutate the input array', () => {
    const original = [...MOCK_PRODUCTS].map((p) => p.slug);
    applySorting([...MOCK_PRODUCTS], 'price_asc');
    expect([...MOCK_PRODUCTS].map((p) => p.slug)).toEqual(original);
  });

  it('defaults to featured sort when sortBy is undefined', () => {
    const withUndefined = applySorting([...MOCK_PRODUCTS], undefined);
    const withFeatured = applySorting([...MOCK_PRODUCTS], 'featured');
    expect(withUndefined.map((p) => p.id)).toEqual(withFeatured.map((p) => p.id));
  });
});

// ===========================================================================
// normalizePaginationParams
// ===========================================================================
describe('normalizePaginationParams', () => {
  it('uses defaults when both params are undefined', () => {
    expect(normalizePaginationParams(undefined, undefined)).toEqual({ page: 1, limit: 12 });
  });

  it('clamps page to minimum of 1', () => {
    expect(normalizePaginationParams(0, 10)).toEqual({ page: 1, limit: 10 });
    expect(normalizePaginationParams(-5, 10)).toEqual({ page: 1, limit: 10 });
  });

  it('clamps limit to minimum of 1', () => {
    expect(normalizePaginationParams(1, 0)).toEqual({ page: 1, limit: 1 });
  });

  it('clamps limit to maximum of 100', () => {
    expect(normalizePaginationParams(1, 500)).toEqual({ page: 1, limit: 100 });
  });

  it('floors fractional values', () => {
    expect(normalizePaginationParams(1.9, 12.7)).toEqual({ page: 1, limit: 12 });
  });
});

// ===========================================================================
// buildPaginationMeta
// ===========================================================================
describe('buildPaginationMeta', () => {
  it('computes correct totalPages', () => {
    expect(buildPaginationMeta(24, 1, 12).totalPages).toBe(2);
    expect(buildPaginationMeta(25, 1, 12).totalPages).toBe(3);
    expect(buildPaginationMeta(12, 1, 12).totalPages).toBe(1);
  });

  it('sets hasNextPage correctly', () => {
    expect(buildPaginationMeta(24, 1, 12).hasNextPage).toBe(true);
    expect(buildPaginationMeta(24, 2, 12).hasNextPage).toBe(false);
  });

  it('sets hasPrevPage correctly', () => {
    expect(buildPaginationMeta(24, 1, 12).hasPrevPage).toBe(false);
    expect(buildPaginationMeta(24, 2, 12).hasPrevPage).toBe(true);
  });

  it('returns totalPages of 1 for empty results', () => {
    const meta = buildPaginationMeta(0, 1, 12);
    expect(meta.totalPages).toBe(1);
    expect(meta.totalItems).toBe(0);
    expect(meta.hasNextPage).toBe(false);
  });

  it('reflects the input page and limit verbatim', () => {
    const meta = buildPaginationMeta(50, 3, 10);
    expect(meta.page).toBe(3);
    expect(meta.limit).toBe(10);
  });
});

// ===========================================================================
// applyPagination
// ===========================================================================
describe('applyPagination', () => {
  const items = Array.from({ length: 24 }, (_, i) => i + 1);

  it('returns the first page correctly', () => {
    expect(applyPagination(items, 1, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('returns the second page correctly', () => {
    expect(applyPagination(items, 2, 10)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });

  it('returns partial last page', () => {
    expect(applyPagination(items, 3, 10)).toEqual([21, 22, 23, 24]);
  });

  it('returns empty array when page is beyond range', () => {
    expect(applyPagination(items, 10, 10)).toEqual([]);
  });

  it('does not mutate the source array', () => {
    const copy = [...items];
    applyPagination(copy, 1, 5);
    expect(copy).toHaveLength(24);
  });
});
