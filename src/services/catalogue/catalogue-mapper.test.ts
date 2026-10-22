import { describe, it, expect } from 'vitest';
import {
  mapCategoryDto,
  mapPaginatedProductsDto,
  mapProductDto,
  mapSubcategoryDto,
} from './catalogue-mapper';

describe('catalogue-mapper', () => {
  describe('mapProductDto', () => {
    it('maps standard product payload directly', () => {
      const input = {
        id: 'prod-101',
        slug: 'test-product',
        name: 'Test Product',
        shortDescription: 'Short summary',
        description: 'Detailed description',
        price: 5000,
        salePrice: 4000,
        currency: 'PKR',
        brand: 'VYRO',
        categorySlug: 'audio-sound',
        subcategorySlug: 'wireless-earbuds',
        stockStatus: 'in_stock',
        rating: 4.5,
        reviewCount: 20,
        badges: ['bestseller'],
      };

      const product = mapProductDto(input);
      expect(product.id).toBe('prod-101');
      expect(product.slug).toBe('test-product');
      expect(product.price).toBe(5000);
      expect(product.salePrice).toBe(4000);
      expect(product.currency).toBe('PKR');
      expect(product.stockStatus).toBe('in_stock');
      expect(product.badges).toEqual(['bestseller']);
    });

    it('maps MongoDB _id to domain id when id is absent', () => {
      const input = {
        _id: '65b4c529f8a12e3456789abc',
        name: 'MongoDB Stored Item',
        price: 1500,
      };

      const product = mapProductDto(input);
      expect(product.id).toBe('65b4c529f8a12e3456789abc');
      expect(product.slug).toBe('mongodb-stored-item');
    });

    it('converts stringified numbers for price and salePrice', () => {
      const input = {
        id: 'prod-str-price',
        name: 'String Price Product',
        price: '7999.50',
        salePrice: '5999.00',
      };

      const product = mapProductDto(input);
      expect(product.price).toBe(7999.5);
      expect(product.salePrice).toBe(5999);
    });

    it('discards salePrice if it is greater than or equal to base price', () => {
      const input = {
        id: 'prod-invalid-sale',
        name: 'Invalid Sale Product',
        price: 5000,
        salePrice: 6000, // Invalid!
      };

      const product = mapProductDto(input);
      expect(product.price).toBe(5000);
      expect(product.salePrice).toBeUndefined();
    });

    it('normalizes string image URL into full ProductImage object', () => {
      const input = {
        id: 'prod-str-img',
        name: 'String Image Item',
        price: 1000,
        primaryImage: 'https://images.unsplash.com/photo-example',
      };

      const product = mapProductDto(input);
      expect(product.primaryImage).toEqual({
        id: 'img-string-image-item-primary',
        url: 'https://images.unsplash.com/photo-example',
        altText: 'String Image Item',
        width: 800,
        height: 800,
        isPrimary: true,
      });
    });

    it('supports external dummy API field "image"', () => {
      const input = {
        id: 'prod-dummy',
        name: 'External Dummy Item',
        price: 2500,
        image: 'https://fakestoreapi.com/img/1.jpg',
      };

      const product = mapProductDto(input);
      expect(product.primaryImage.url).toBe('https://fakestoreapi.com/img/1.jpg');
    });

    it('falls back unknown stockStatus to "in_stock"', () => {
      const input = {
        id: 'prod-stock',
        name: 'Stock Check',
        price: 1000,
        stockStatus: 'non_existent_status',
      };

      const product = mapProductDto(input);
      expect(product.stockStatus).toBe('in_stock');
    });

    it('clamps rating to range [0, 5]', () => {
      const inputHigh = { id: 'p1', name: 'High', price: 100, rating: 9.8 };
      const inputLow = { id: 'p2', name: 'Low', price: 100, rating: -2 };

      expect(mapProductDto(inputHigh).rating).toBe(5);
      expect(mapProductDto(inputLow).rating).toBe(0);
    });

    it('throws error when input is not an object', () => {
      expect(() => mapProductDto(null)).toThrow('Invalid product DTO');
      expect(() => mapProductDto('string')).toThrow('Invalid product DTO');
    });
  });

  describe('mapCategoryDto & mapSubcategoryDto', () => {
    it('maps category and nested subcategories', () => {
      const raw = {
        _id: 'cat-mongo-1',
        slug: 'audio-sound',
        name: 'Audio & Sound',
        subcategories: [
          {
            _id: 'sub-mongo-1',
            slug: 'wireless-earbuds',
            name: 'Wireless Earbuds',
          },
        ],
      };

      const category = mapCategoryDto(raw);
      expect(category.id).toBe('cat-mongo-1');
      expect(category.slug).toBe('audio-sound');
      expect(category.subcategories).toHaveLength(1);
      expect(category.subcategories[0].id).toBe('sub-mongo-1');
      expect(category.subcategories[0].categorySlug).toBe('audio-sound');
    });

    it('maps standalone subcategory with parentCategorySlug', () => {
      const raw = {
        id: 'sub-standalone',
        name: 'Gaming Headsets',
      };

      const subcategory = mapSubcategoryDto(raw, 'gaming');
      expect(subcategory.id).toBe('sub-standalone');
      expect(subcategory.slug).toBe('gaming-headsets');
      expect(subcategory.categorySlug).toBe('gaming');
    });
  });

  describe('mapPaginatedProductsDto', () => {
    it('maps standard paginated envelope', () => {
      const raw = {
        items: [
          { id: 'p1', name: 'Product 1', price: 1000 },
          { id: 'p2', name: 'Product 2', price: 2000 },
        ],
        pagination: {
          page: 2,
          limit: 10,
          totalItems: 25,
          totalPages: 3,
          hasNextPage: true,
          hasPrevPage: true,
        },
        appliedFilters: { search: 'test' },
      };

      const result = mapPaginatedProductsDto(raw);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].name).toBe('Product 1');
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.totalItems).toBe(25);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.appliedFilters?.search).toBe('test');
    });

    it('maps direct array of products and calculates fallback pagination', () => {
      const raw = [
        { id: 'p1', name: 'Product 1', price: 1000 },
        { id: 'p2', name: 'Product 2', price: 2000 },
      ];

      const result = mapPaginatedProductsDto(raw, { page: 1, limit: 12 });
      expect(result.items).toHaveLength(2);
      expect(result.pagination.totalItems).toBe(2);
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.hasNextPage).toBe(false);
    });

    it('returns empty safe envelope for null or invalid input', () => {
      const result = mapPaginatedProductsDto(null);
      expect(result.items).toEqual([]);
      expect(result.pagination.totalItems).toBe(0);
      expect(result.pagination.page).toBe(1);
    });
  });
});
