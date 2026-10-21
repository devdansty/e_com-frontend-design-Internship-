import { describe, it, expect } from 'vitest';
import {
  MOCK_PRODUCTS,
  getMockProducts,
  getMockProductById,
  getMockProductBySlug,
  getMockProductsByCategory,
  getMockProductsBySubcategory,
  getFeaturedMockProducts,
} from './mock-products';
import {
  getAllCategories,
  getAllSubcategories,
  isValidCategorySlug,
  isValidSubcategorySlug,
} from '../../categories';

const KEBAB_CASE_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

describe('Mock Products Dataset - Completeness & Distribution', () => {
  it('contains at least 24 distinct products', () => {
    expect(MOCK_PRODUCTS.length).toBeGreaterThanOrEqual(24);
  });

  it('distributes products across all 6 categories', () => {
    const categories = getAllCategories();
    expect(categories).toHaveLength(6);

    for (const cat of categories) {
      const categoryProducts = getMockProductsByCategory(cat.slug);
      expect(
        categoryProducts.length,
        `Category "${cat.name}" (${cat.slug}) must have at least one product`,
      ).toBeGreaterThan(0);
    }
  });

  it('distributes products across all 18 subcategories', () => {
    const subcategories = getAllSubcategories();
    expect(subcategories).toHaveLength(18);

    for (const sub of subcategories) {
      const subProducts = getMockProductsBySubcategory(sub.slug);
      expect(
        subProducts.length,
        `Subcategory "${sub.name}" (${sub.slug}) must have at least one product`,
      ).toBeGreaterThan(0);
    }
  });
});

describe('Mock Products Dataset - Slug and ID Uniqueness', () => {
  it('has globally unique product IDs', () => {
    const ids = MOCK_PRODUCTS.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('has globally unique product slugs', () => {
    const slugs = MOCK_PRODUCTS.map((p) => p.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it('has globally unique SKUs when present', () => {
    const skus = MOCK_PRODUCTS.map((p) => p.sku).filter(Boolean);
    const uniqueSkus = new Set(skus);
    expect(uniqueSkus.size).toBe(skus.length);
  });

  it('enforces kebab-case format on all product slugs', () => {
    for (const p of MOCK_PRODUCTS) {
      expect(p.slug).toMatch(KEBAB_CASE_REGEX);
    }
  });

  it('ensures product names and slugs are distinct', () => {
    for (const p of MOCK_PRODUCTS) {
      expect(p.slug).not.toBe(p.name);
      expect(p.id).not.toBe(p.name);
    }
  });
});

describe('Mock Products Dataset - Category & Subcategory Integrity', () => {
  it('ensures every product references a valid categorySlug', () => {
    for (const p of MOCK_PRODUCTS) {
      expect(
        isValidCategorySlug(p.categorySlug),
        `Product ${p.slug} has invalid categorySlug "${p.categorySlug}"`,
      ).toBe(true);
    }
  });

  it('ensures every product references a valid subcategorySlug matching its category', () => {
    for (const p of MOCK_PRODUCTS) {
      expect(
        isValidSubcategorySlug(p.categorySlug, p.subcategorySlug),
        `Product ${p.slug} has mismatched category/subcategory (${p.categorySlug} / ${p.subcategorySlug})`,
      ).toBe(true);
    }
  });
});

describe('Mock Products Dataset - Price Integrity', () => {
  it('ensures base prices are positive numeric values in PKR', () => {
    for (const p of MOCK_PRODUCTS) {
      expect(typeof p.price).toBe('number');
      expect(p.price).toBeGreaterThan(0);
      expect(Number.isFinite(p.price)).toBe(true);
      expect(p.currency).toBe('PKR');
    }
  });

  it('ensures sale prices do not exceed original prices', () => {
    for (const p of MOCK_PRODUCTS) {
      if (p.salePrice !== undefined) {
        expect(typeof p.salePrice).toBe('number');
        expect(p.salePrice).toBeGreaterThan(0);
        expect(
          p.salePrice,
          `Product ${p.slug} has salePrice (${p.salePrice}) >= price (${p.price})`,
        ).toBeLessThan(p.price);
      }
    }
  });

  it('ensures variant prices and sale prices follow identical rules', () => {
    for (const p of MOCK_PRODUCTS) {
      if (p.variants) {
        for (const variant of p.variants) {
          if (variant.price !== undefined) {
            expect(variant.price).toBeGreaterThan(0);
          }
          if (variant.salePrice !== undefined) {
            const basePrice = variant.price ?? p.price;
            expect(variant.salePrice).toBeLessThan(basePrice);
          }
        }
      }
    }
  });
});

describe('Mock Products Dataset - Media & Content Integrity', () => {
  it('ensures every product has a valid primary image with dimensions and altText', () => {
    for (const p of MOCK_PRODUCTS) {
      expect(p.primaryImage).toBeDefined();
      expect(p.primaryImage.id.trim()).not.toBe('');
      expect(p.primaryImage.url.trim()).not.toBe('');
      expect(p.primaryImage.altText.trim()).not.toBe('');
      expect(p.primaryImage.isPrimary).toBe(true);
      expect(p.primaryImage.width).toBeGreaterThan(0);
      expect(p.primaryImage.height).toBeGreaterThan(0);
    }
  });

  it('ensures gallery images have valid IDs, URLs, and altText', () => {
    for (const p of MOCK_PRODUCTS) {
      if (p.gallery) {
        for (const img of p.gallery) {
          expect(img.id.trim()).not.toBe('');
          expect(img.url.trim()).not.toBe('');
          expect(img.altText.trim()).not.toBe('');
        }
      }
    }
  });

  it('ensures mandatory string fields are non-empty and well-formed', () => {
    for (const p of MOCK_PRODUCTS) {
      expect(p.name.trim()).not.toBe('');
      expect(p.shortDescription.trim()).not.toBe('');
      expect(p.description.trim()).not.toBe('');
      expect(p.brand).toBe('VYRO');
      expect(p.features.length).toBeGreaterThanOrEqual(3);
      expect(p.specifications.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('ensures ratings and reviews fall within valid boundaries', () => {
    for (const p of MOCK_PRODUCTS) {
      if (p.rating !== undefined) {
        expect(p.rating).toBeGreaterThanOrEqual(0);
        expect(p.rating).toBeLessThanOrEqual(5);
      }
      if (p.reviewCount !== undefined) {
        expect(p.reviewCount).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('ensures related product IDs reference valid products in the catalog', () => {
    const allIds = new Set(MOCK_PRODUCTS.map((p) => p.id));
    for (const p of MOCK_PRODUCTS) {
      if (p.relatedProductIds) {
        for (const relatedId of p.relatedProductIds) {
          expect(
            allIds.has(relatedId),
            `Product ${p.slug} references nonexistent related product "${relatedId}"`,
          ).toBe(true);
          expect(relatedId).not.toBe(p.id);
        }
      }
    }
  });

  it('ensures stockStatus uses valid standardized enum values', () => {
    const validStatuses = new Set([
      'in_stock',
      'low_stock',
      'out_of_stock',
      'preorder',
      'discontinued',
    ]);
    for (const p of MOCK_PRODUCTS) {
      expect(validStatuses.has(p.stockStatus)).toBe(true);
    }
  });
});

describe('Mock Products Dataset - Query and Helper Functions', () => {
  it('retrieves all products with getMockProducts', () => {
    const products = getMockProducts();
    expect(products).toHaveLength(24);
  });

  it('retrieves product by ID with getMockProductById', () => {
    const prod = getMockProductById('prod-pulse-anc');
    expect(prod).toBeDefined();
    expect(prod?.name).toBe('VYRO Pulse ANC Wireless Earbuds');

    expect(getMockProductById('nonexistent-id')).toBeUndefined();
    expect(getMockProductById('')).toBeUndefined();
  });

  it('retrieves product by slug with getMockProductBySlug case-insensitively', () => {
    const prod = getMockProductBySlug(' VYRO-PULSE-ANC-EARBUDS ');
    expect(prod).toBeDefined();
    expect(prod?.id).toBe('prod-pulse-anc');

    expect(getMockProductBySlug('nonexistent-slug')).toBeUndefined();
    expect(getMockProductBySlug('')).toBeUndefined();
  });

  it('filters products by category with getMockProductsByCategory', () => {
    const audioProducts = getMockProductsByCategory('audio-sound');
    expect(audioProducts.length).toBeGreaterThan(0);
    expect(audioProducts.every((p) => p.categorySlug === 'audio-sound')).toBe(true);

    expect(getMockProductsByCategory('nonexistent-cat')).toEqual([]);
    expect(getMockProductsByCategory('')).toEqual([]);
  });

  it('filters products by subcategory with getMockProductsBySubcategory', () => {
    const earbuds = getMockProductsBySubcategory('wireless-earbuds');
    expect(earbuds.length).toBeGreaterThanOrEqual(1);
    expect(earbuds.every((p) => p.subcategorySlug === 'wireless-earbuds')).toBe(true);

    expect(getMockProductsBySubcategory('nonexistent-sub')).toEqual([]);
    expect(getMockProductsBySubcategory('')).toEqual([]);
  });

  it('retrieves only featured products with getFeaturedMockProducts', () => {
    const featured = getFeaturedMockProducts();
    expect(featured.length).toBeGreaterThan(0);
    expect(featured.every((p) => p.isFeatured === true)).toBe(true);
  });
});
