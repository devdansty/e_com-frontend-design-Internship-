/**
 * Common primitive types and domain value objects shared across features.
 * All types here are pure TypeScript definitions with zero runtime overhead.
 */

/**
 * Supported currency codes across the VYRO platform.
 * Target market is Pakistan, with PKR as the primary base currency.
 */
export type CurrencyCode = 'PKR' | 'USD' | 'EUR' | 'GBP';

/**
 * Standardized inventory and stock availability statuses.
 */
export type StockStatus =
  | 'in_stock'
  | 'low_stock'
  | 'out_of_stock'
  | 'preorder'
  | 'discontinued';

/**
 * Standard product and catalog image asset metadata.
 */
export interface ProductImage {
  id: string;
  url: string;
  altText: string;
  width?: number;
  height?: number;
  isPrimary?: boolean;
}

/**
 * Generic unique identifier alias for entity IDs.
 */
export type EntityId = string;

/**
 * Standard sort direction order.
 */
export type SortOrder = 'asc' | 'desc';
