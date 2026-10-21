import type { CurrencyCode, ProductImage, StockStatus } from '../../../types/common';

/**
 * Promotional and merchandising badges for catalog items.
 */
export type ProductBadge =
  | 'new'
  | 'featured'
  | 'bestseller'
  | 'sale'
  | 'trending'
  | 'limited_edition'
  | 'official_warranty';

/**
 * Key-value technical specification entry with optional logical grouping.
 * Example: { name: 'Bluetooth Version', value: '5.4', group: 'Connectivity' }
 */
export interface ProductSpecification {
  name: string;
  value: string;
  group?: string;
}

/**
 * Supported variation types for consumer electronics and gadgets.
 */
export type ProductVariantType = 'color' | 'storage' | 'size' | 'edition' | 'style';

/**
 * Specific purchasable variant of a parent product.
 */
export interface ProductVariant {
  id: string;
  sku?: string;
  name: string;
  type: ProductVariantType;
  value: string;
  price?: number;
  salePrice?: number;
  stockStatus: StockStatus;
  stockQuantity?: number;
  image?: ProductImage;
}

/**
 * Aggregated rating metrics for a product.
 */
export interface ProductRating {
  average: number;
  count: number;
}

/**
 * Core Product domain entity for the VYRO e-commerce platform.
 * Completely independent of presentation components.
 */
export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  salePrice?: number;
  currency: CurrencyCode;
  brand: string;
  categorySlug: string;
  subcategorySlug: string;
  primaryImage: ProductImage;
  gallery?: ProductImage[];
  features: string[];
  specifications: ProductSpecification[];
  variants?: ProductVariant[];
  stockStatus: StockStatus;
  rating?: number;
  reviewCount?: number;
  badges?: ProductBadge[];
  relatedProductIds?: string[];
  sku?: string;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
