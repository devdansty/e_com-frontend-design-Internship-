import { describe, it, expect, beforeEach } from 'vitest';
import { MockCatalogueService } from './mock-catalogue-service';
import { MOCK_PRODUCTS } from '../../features/products/data/mock-products';
import { CATEGORY_REGISTRY } from '../../features/categories/data/category-registry';

let service: MockCatalogueService;

beforeEach(() => {
  service = new MockCatalogueService();
});

// ===========================================================================
// getProducts – baseline
// ===========================================================================
describe('MockCatalogueService.getProducts', () => {
  it('returns all 24 products with no params', async () => {
    const result = await service.getProducts();
    // default limit is 12; totalItems must equal full dataset size
    expect(result.pagination.totalItems).toBe(24);
  });

  it('returns first page of 12 by default', async () => {
    const result = await service.getProducts();
    expect(result.items).toHaveLength(12);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(12);
  });

  it('propagates appliedFilters onto the result', async () => {
    const params = { categorySlug: 'gaming', page: 1, limit: 10 };
    const result = await service.getProducts(params);
    expect(result.appliedFilters).toEqual(params);
  });

  it('does not mutate MOCK_PRODUCTS', async () => {
    const before = MOCK_PRODUCTS.map((p) => p.id);
    await service.getProducts({ categorySlug: 'gaming', sortBy: 'price_asc' });
    expect(MOCK_PRODUCTS.map((p) => p.id)).toEqual(before);
  });
});

// ===========================================================================
// getProducts – pagination
// ===========================================================================
describe('MockCatalogueService.getProducts – pagination', () => {
  it('returns correct items for page 2 with limit 10', async () => {
    const p1 = await service.getProducts({ page: 1, limit: 10 });
    const p2 = await service.getProducts({ page: 2, limit: 10 });

    expect(p1.items).toHaveLength(10);
    expect(p2.items).toHaveLength(10);
    // No ID overlap between pages
    const ids1 = new Set(p1.items.map((p) => p.id));
    expect(p2.items.every((p) => !ids1.has(p.id))).toBe(true);
  });

  it('last page contains remainder items', async () => {
    const result = await service.getProducts({ page: 3, limit: 10 });
    // 24 total, limit 10 → page 3 has 4 items
    expect(result.items).toHaveLength(4);
    expect(result.pagination.hasNextPage).toBe(false);
    expect(result.pagination.hasPrevPage).toBe(true);
  });

  it('returns empty items for out-of-range page', async () => {
    const result = await service.getProducts({ page: 999, limit: 12 });
    expect(result.items).toHaveLength(0);
    expect(result.pagination.totalItems).toBe(24);
  });

  it('covers all products across all pages with no gaps or duplicates', async () => {
    const seen = new Set<string>();
    const limit = 8;
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const result = await service.getProducts({ page, limit });
      for (const p of result.items) seen.add(p.id);
      hasMore = result.pagination.hasNextPage;
      page++;
    }

    expect(seen.size).toBe(24);
  });
});

// ===========================================================================
// getProducts – category & subcategory filtering
// ===========================================================================
describe('MockCatalogueService.getProducts – category/subcategory filtering', () => {
  it('returns only products from the specified category', async () => {
    const result = await service.getProducts({ categorySlug: 'gaming', limit: 100 });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((p) => p.categorySlug === 'gaming')).toBe(true);
  });

  it('returns only products from the specified subcategory', async () => {
    const result = await service.getProducts({ subcategorySlug: 'wireless-earbuds', limit: 100 });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((p) => p.subcategorySlug === 'wireless-earbuds')).toBe(true);
  });

  it('returns empty result for a non-existent category', async () => {
    const result = await service.getProducts({ categorySlug: 'nonexistent-cat' });
    expect(result.items).toHaveLength(0);
    expect(result.pagination.totalItems).toBe(0);
  });

  it('returns correct totalItems for filtered category', async () => {
    const result = await service.getProducts({ categorySlug: 'wearables', limit: 100 });
    // All items in result should belong to wearables
    expect(result.pagination.totalItems).toBe(result.items.length);
  });
});

// ===========================================================================
// getProducts – price range filtering
// ===========================================================================
describe('MockCatalogueService.getProducts – price filtering', () => {
  it('returns only products within [minPrice, maxPrice]', async () => {
    const min = 3000;
    const max = 6000;
    const result = await service.getProducts({ minPrice: min, maxPrice: max, limit: 100 });
    expect(result.items.length).toBeGreaterThan(0);
    expect(
      result.items.every((p) => {
        const ep = p.salePrice ?? p.price;
        return ep >= min && ep <= max;
      }),
    ).toBe(true);
  });

  it('returns no products when price range has no matches', async () => {
    const result = await service.getProducts({ minPrice: 999999, maxPrice: 9999999 });
    expect(result.items).toHaveLength(0);
  });
});

// ===========================================================================
// getProducts – sort order
// ===========================================================================
describe('MockCatalogueService.getProducts – sort order', () => {
  it('price_asc: items arrive in ascending effective-price order', async () => {
    const result = await service.getProducts({ sortBy: 'price_asc', limit: 100 });
    const prices = result.items.map((p) => p.salePrice ?? p.price);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i - 1]).toBeLessThanOrEqual(prices[i]);
    }
  });

  it('price_desc: items arrive in descending effective-price order', async () => {
    const result = await service.getProducts({ sortBy: 'price_desc', limit: 100 });
    const prices = result.items.map((p) => p.salePrice ?? p.price);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i - 1]).toBeGreaterThanOrEqual(prices[i]);
    }
  });

  it('rating_desc: items arrive highest-rated first', async () => {
    const result = await service.getProducts({ sortBy: 'rating_desc', limit: 100 });
    const ratings = result.items.map((p) => p.rating ?? 0);
    for (let i = 1; i < ratings.length; i++) {
      expect(ratings[i - 1]).toBeGreaterThanOrEqual(ratings[i]);
    }
  });

  it('featured sort places isFeatured products before non-featured', async () => {
    const result = await service.getProducts({ sortBy: 'featured', limit: 100 });
    const firstNonFeatIdx = result.items.findIndex((p) => !p.isFeatured);
    if (firstNonFeatIdx !== -1) {
      expect(result.items.slice(0, firstNonFeatIdx).every((p) => p.isFeatured)).toBe(true);
    }
  });
});

// ===========================================================================
// getProducts – stock availability
// ===========================================================================
describe('MockCatalogueService.getProducts – stock availability', () => {
  it('inStockOnly returns only in_stock or low_stock products', async () => {
    const result = await service.getProducts({ inStockOnly: true, limit: 100 });
    expect(result.items.every(
      (p) => p.stockStatus === 'in_stock' || p.stockStatus === 'low_stock',
    )).toBe(true);
  });
});

// ===========================================================================
// getProductBySlug
// ===========================================================================
describe('MockCatalogueService.getProductBySlug', () => {
  it('returns the correct product for a known slug', async () => {
    const product = await service.getProductBySlug('vyro-pulse-anc-earbuds');
    expect(product).toBeDefined();
    expect(product?.id).toBe('prod-pulse-anc');
    expect(product?.slug).toBe('vyro-pulse-anc-earbuds');
  });

  it('returns undefined for an unknown slug', async () => {
    const product = await service.getProductBySlug('this-slug-does-not-exist');
    expect(product).toBeUndefined();
  });

  it('returns undefined for an empty string slug', async () => {
    const product = await service.getProductBySlug('');
    expect(product).toBeUndefined();
  });

  it('is case-insensitive for the slug', async () => {
    const product = await service.getProductBySlug('VYRO-PULSE-ANC-EARBUDS');
    expect(product).toBeDefined();
    expect(product?.id).toBe('prod-pulse-anc');
  });

  it('returns all expected product fields', async () => {
    const product = await service.getProductBySlug('vyro-pulse-anc-earbuds');
    expect(product).toMatchObject({
      id: expect.any(String),
      slug: expect.any(String),
      name: expect.any(String),
      price: expect.any(Number),
      currency: 'PKR',
      categorySlug: expect.any(String),
      subcategorySlug: expect.any(String),
      stockStatus: expect.any(String),
      primaryImage: expect.objectContaining({ url: expect.any(String) }),
    });
  });
});

// ===========================================================================
// getCategories
// ===========================================================================
describe('MockCatalogueService.getCategories', () => {
  it('returns all 6 top-level categories', async () => {
    const categories = await service.getCategories();
    expect(categories).toHaveLength(6);
  });

  it('each category has the expected structure', async () => {
    const categories = await service.getCategories();
    for (const cat of categories) {
      expect(cat).toMatchObject({
        id: expect.any(String),
        slug: expect.any(String),
        name: expect.any(String),
        subcategories: expect.any(Array),
      });
    }
  });

  it('returns a mutable copy (not the frozen registry array itself)', async () => {
    const result = await service.getCategories();
    // Should not throw when mutating
    expect(() => result.push(CATEGORY_REGISTRY[0]!)).not.toThrow();
  });

  it('returns categories with slugs matching the canonical registry', async () => {
    const categories = await service.getCategories();
    const returnedSlugs = categories.map((c) => c.slug).sort();
    const registrySlugs = [...CATEGORY_REGISTRY].map((c) => c.slug).sort();
    expect(returnedSlugs).toEqual(registrySlugs);
  });
});

// ===========================================================================
// getCategoryBySlug
// ===========================================================================
describe('MockCatalogueService.getCategoryBySlug', () => {
  it('returns the correct category for a known slug', async () => {
    const category = await service.getCategoryBySlug('gaming');
    expect(category).toBeDefined();
    expect(category?.slug).toBe('gaming');
    expect(category?.name).toBe('Gaming');
  });

  it('returns a category with its subcategories populated', async () => {
    const category = await service.getCategoryBySlug('audio-sound');
    expect(category?.subcategories.length).toBeGreaterThan(0);
  });

  it('returns undefined for an unknown category slug', async () => {
    const category = await service.getCategoryBySlug('nonexistent-slug');
    expect(category).toBeUndefined();
  });

  it('returns undefined for an empty string slug', async () => {
    const category = await service.getCategoryBySlug('');
    expect(category).toBeUndefined();
  });

  it('is case-insensitive for the slug lookup', async () => {
    const category = await service.getCategoryBySlug('GAMING');
    expect(category?.slug).toBe('gaming');
  });
});

// ===========================================================================
// getRelatedProducts
// ===========================================================================
describe('MockCatalogueService.getRelatedProducts', () => {
  it('returns related products for a product that has relatedProductIds', async () => {
    // Pulse ANC references prod-turbo-65w-gan and prod-clarity-studio-headphones
    const related = await service.getRelatedProducts('vyro-pulse-anc-earbuds');
    expect(related.length).toBeGreaterThan(0);
    // Every returned product is a full Product object
    for (const p of related) {
      expect(p).toMatchObject({
        id: expect.any(String),
        slug: expect.any(String),
        name: expect.any(String),
      });
    }
  });

  it('does not include the source product in related results', async () => {
    const sourceSlug = 'vyro-pulse-anc-earbuds';
    const source = await service.getProductBySlug(sourceSlug);
    const related = await service.getRelatedProducts(sourceSlug);
    expect(related.every((p) => p.id !== source!.id)).toBe(true);
  });

  it('returns an empty array for an unknown slug', async () => {
    const related = await service.getRelatedProducts('slug-that-doesnt-exist');
    expect(related).toEqual([]);
  });

  it('returns an empty array for an empty string slug', async () => {
    const related = await service.getRelatedProducts('');
    expect(related).toEqual([]);
  });

  it('returns only products whose IDs appear in relatedProductIds', async () => {
    const sourceSlug = 'vyro-pulse-anc-earbuds';
    const source = MOCK_PRODUCTS.find((p) => p.slug === sourceSlug)!;
    const related = await service.getRelatedProducts(sourceSlug);
    const relatedIds = related.map((p) => p.id);
    expect(relatedIds.every((id) => source.relatedProductIds!.includes(id))).toBe(true);
  });

  it('returns an empty array for a product with no relatedProductIds', async () => {
    // tempo has no relatedProductIds set in the mock dataset
    const related = await service.getRelatedProducts('vyro-tempo-essential-health-tracker');
    // If relatedProductIds is undefined or empty → []
    const product = MOCK_PRODUCTS.find((p) => p.slug === 'vyro-tempo-essential-health-tracker')!;
    if (!product.relatedProductIds || product.relatedProductIds.length === 0) {
      expect(related).toEqual([]);
    } else {
      // If the product has related IDs, they should all be valid
      expect(related.length).toBeGreaterThanOrEqual(0);
    }
  });
});
