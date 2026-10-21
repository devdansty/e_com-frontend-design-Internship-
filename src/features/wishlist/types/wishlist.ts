import type { Product } from '../../products/types/product';

/**
 * Branded identifier type for product IDs stored in a wishlist.
 */
export type WishlistProductId = string;

/**
 * Identifier string used for wishlist membership lookup and toggle operations.
 * Can be a standard productId or composite `${productId}:${variantId}`.
 */
export type WishlistIdentifier = string;

/**
 * Individual saved wishlist item.
 * Stores minimal reference data for offline/persisted client storage.
 */
export interface WishlistItem {
  id: string;
  productId: WishlistProductId;
  variantId?: string;
  addedAt: string;
  note?: string;
}

/**
 * Hydrated wishlist item with complete Product entity details for catalog rendering.
 */
export interface PopulatedWishlistItem extends WishlistItem {
  product: Product;
}

/**
 * Client-side wishlist state structure, optimized for fast membership queries.
 */
export interface WishlistState {
  productIds: WishlistProductId[];
  items: WishlistItem[];
  updatedAt?: string;
}
