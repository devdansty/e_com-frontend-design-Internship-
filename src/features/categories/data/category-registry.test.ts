import { describe, it, expect } from 'vitest';
import {
  CATEGORY_REGISTRY,
  getAllCategories,
  getFeaturedCategories,
  getCategoryBySlug,
  getSubcategoryBySlug,
  findSubcategoryBySlug,
  getAllSubcategories,
  getCategorySlugs,
  getSubcategorySlugs,
  isValidCategorySlug,
  isValidSubcategorySlug,
} from './category-registry';

const KEBAB_CASE_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

describe('Category Registry - Taxonomy Completeness', () => {
  it('contains exactly the 6 required top-level categories', () => {
    const categories = getAllCategories();
    expect(categories).toHaveLength(6);

    const slugs = categories.map((c) => c.slug);
    expect(slugs).toEqual([
      'audio-sound',
      'wearables',
      'power-charging',
      'mobile-accessories',
      'gaming',
      'smart-living',
    ]);
  });

  it('contains the expected subcategories for Audio & Sound', () => {
    const audio = getCategoryBySlug('audio-sound');
    expect(audio).toBeDefined();
    expect(audio?.name).toBe('Audio & Sound');

    const subSlugs = audio?.subcategories.map((s) => s.slug);
    expect(subSlugs).toEqual([
      'wireless-earbuds',
      'headphones',
      'speakers',
      'neckbands',
    ]);
  });

  it('contains the expected subcategories for Wearables', () => {
    const wearables = getCategoryBySlug('wearables');
    expect(wearables).toBeDefined();
    expect(wearables?.name).toBe('Wearables');

    const subSlugs = wearables?.subcategories.map((s) => s.slug);
    expect(subSlugs).toEqual(['smartwatches', 'fitness-bands']);
  });

  it('contains the expected subcategories for Power & Charging', () => {
    const power = getCategoryBySlug('power-charging');
    expect(power).toBeDefined();
    expect(power?.name).toBe('Power & Charging');

    const subSlugs = power?.subcategories.map((s) => s.slug);
    expect(subSlugs).toEqual([
      'power-banks',
      'wall-chargers',
      'charging-cables',
    ]);
  });

  it('contains the expected subcategories for Mobile Accessories', () => {
    const accessories = getCategoryBySlug('mobile-accessories');
    expect(accessories).toBeDefined();
    expect(accessories?.name).toBe('Mobile Accessories');

    const subSlugs = accessories?.subcategories.map((s) => s.slug);
    expect(subSlugs).toEqual([
      'cases-covers',
      'stands-holders',
      'car-accessories',
    ]);
  });

  it('contains the expected subcategories for Gaming', () => {
    const gaming = getCategoryBySlug('gaming');
    expect(gaming).toBeDefined();
    expect(gaming?.name).toBe('Gaming');

    const subSlugs = gaming?.subcategories.map((s) => s.slug);
    expect(subSlugs).toEqual([
      'gaming-headsets',
      'controllers',
      'gaming-accessories',
    ]);
  });

  it('contains the expected subcategories for Smart Living', () => {
    const smartLiving = getCategoryBySlug('smart-living');
    expect(smartLiving).toBeDefined();
    expect(smartLiving?.name).toBe('Smart Living');

    const subSlugs = smartLiving?.subcategories.map((s) => s.slug);
    expect(subSlugs).toEqual([
      'smart-lights',
      'security-cameras',
      'smart-plugs',
    ]);
  });

  it('has a total of 18 subcategories across the registry', () => {
    const allSubs = getAllSubcategories();
    expect(allSubs).toHaveLength(18);
  });
});

describe('Category Registry - Slug and ID Uniqueness', () => {
  it('has unique slugs for all categories', () => {
    const slugs = CATEGORY_REGISTRY.map((c) => c.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it('has unique IDs for all categories', () => {
    const ids = CATEGORY_REGISTRY.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('has unique slugs across all subcategories', () => {
    const subSlugs = getAllSubcategories().map((s) => s.slug);
    const uniqueSubSlugs = new Set(subSlugs);
    expect(uniqueSubSlugs.size).toBe(subSlugs.length);
  });

  it('has unique IDs across all subcategories', () => {
    const subIds = getAllSubcategories().map((s) => s.id);
    const uniqueSubIds = new Set(subIds);
    expect(uniqueSubIds.size).toBe(subIds.length);
  });

  it('enforces kebab-case format on all category and subcategory slugs', () => {
    for (const category of CATEGORY_REGISTRY) {
      expect(category.slug).toMatch(KEBAB_CASE_REGEX);
      for (const subcategory of category.subcategories) {
        expect(subcategory.slug).toMatch(KEBAB_CASE_REGEX);
      }
    }
  });

  it('keeps identifiers distinct from human-readable display names', () => {
    for (const category of CATEGORY_REGISTRY) {
      expect(category.slug).not.toBe(category.name);
      expect(category.id).not.toBe(category.name);
      for (const subcategory of category.subcategories) {
        expect(subcategory.slug).not.toBe(subcategory.name);
        expect(subcategory.id).not.toBe(subcategory.name);
      }
    }
  });
});

describe('Category Registry - Category and Subcategory Consistency', () => {
  it('ensures every subcategory has a categorySlug matching its parent slug', () => {
    for (const category of CATEGORY_REGISTRY) {
      for (const subcategory of category.subcategories) {
        expect(subcategory.categorySlug).toBe(category.slug);
      }
    }
  });

  it('ensures every category and subcategory has non-empty essential fields', () => {
    for (const category of CATEGORY_REGISTRY) {
      expect(category.id.trim()).not.toBe('');
      expect(category.slug.trim()).not.toBe('');
      expect(category.name.trim()).not.toBe('');
      expect(category.description?.trim()).not.toBe('');
      expect(category.subcategories.length).toBeGreaterThan(0);

      for (const subcategory of category.subcategories) {
        expect(subcategory.id.trim()).not.toBe('');
        expect(subcategory.slug.trim()).not.toBe('');
        expect(subcategory.name.trim()).not.toBe('');
        expect(subcategory.description?.trim()).not.toBe('');
      }
    }
  });

  it('ensures display orders are positive and well-formed', () => {
    for (const category of CATEGORY_REGISTRY) {
      expect(category.displayOrder).toBeGreaterThan(0);
      const subOrders = category.subcategories.map((s) => s.displayOrder);
      const uniqueSubOrders = new Set(subOrders);
      expect(uniqueSubOrders.size).toBe(subOrders.length);
    }
  });
});

describe('Category Registry - Query and Helper Functions', () => {
  it('returns featured categories with getFeaturedCategories', () => {
    const featured = getFeaturedCategories();
    expect(featured.length).toBeGreaterThan(0);
    expect(featured.every((c) => c.isFeatured === true)).toBe(true);
  });

  it('retrieves category by slug case-insensitively and handles whitespace', () => {
    const category = getCategoryBySlug(' AUDIO-SOUND ');
    expect(category).toBeDefined();
    expect(category?.id).toBe('cat-audio-sound');
  });

  it('returns undefined for nonexistent category slug', () => {
    expect(getCategoryBySlug('nonexistent-category')).toBeUndefined();
    expect(getCategoryBySlug('')).toBeUndefined();
  });

  it('retrieves subcategory by category slug and subcategory slug', () => {
    const sub = getSubcategoryBySlug('audio-sound', 'wireless-earbuds');
    expect(sub).toBeDefined();
    expect(sub?.name).toBe('Wireless Earbuds');
    expect(sub?.categorySlug).toBe('audio-sound');
  });

  it('returns undefined when subcategory does not belong to category', () => {
    const mismatch = getSubcategoryBySlug('gaming', 'wireless-earbuds');
    expect(mismatch).toBeUndefined();
  });

  it('finds subcategory and parent category with findSubcategoryBySlug', () => {
    const result = findSubcategoryBySlug('smartwatches');
    expect(result).toBeDefined();
    expect(result?.category.slug).toBe('wearables');
    expect(result?.subcategory.name).toBe('Smartwatches');
  });

  it('validates slugs with isValidCategorySlug', () => {
    expect(isValidCategorySlug('audio-sound')).toBe(true);
    expect(isValidCategorySlug('wearables')).toBe(true);
    expect(isValidCategorySlug('invalid-slug')).toBe(false);
    expect(isValidCategorySlug('')).toBe(false);
  });

  it('validates category-subcategory pairs with isValidSubcategorySlug', () => {
    expect(isValidSubcategorySlug('audio-sound', 'wireless-earbuds')).toBe(true);
    expect(isValidSubcategorySlug('gaming', 'controllers')).toBe(true);
    expect(isValidSubcategorySlug('audio-sound', 'controllers')).toBe(false);
    expect(isValidSubcategorySlug('invalid', 'invalid')).toBe(false);
  });

  it('filters subcategory slugs by category slug when provided', () => {
    const audioSubSlugs = getSubcategorySlugs('audio-sound');
    expect(audioSubSlugs).toEqual([
      'wireless-earbuds',
      'headphones',
      'speakers',
      'neckbands',
    ]);

    const allSubSlugs = getSubcategorySlugs();
    expect(allSubSlugs).toHaveLength(18);

    const empty = getSubcategorySlugs('nonexistent');
    expect(empty).toEqual([]);
  });

  it('returns all category slugs with getCategorySlugs', () => {
    const slugs = getCategorySlugs();
    expect(slugs).toHaveLength(6);
    expect(slugs).toContain('audio-sound');
    expect(slugs).toContain('smart-living');
  });
});
