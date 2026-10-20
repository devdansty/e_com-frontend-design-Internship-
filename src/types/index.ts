/**
 * Centralized Domain Models for the VYRO E-Commerce Platform.
 *
 * Architecture Convention:
 * - Domain entities have a single canonical definition inside their respective feature directory
 *   (e.g., `src/features/products/types/product.ts`).
 * - Cross-cutting infrastructure types (API envelopes, errors, pagination, common value objects)
 *   reside in `src/types/`.
 * - This file acts as a centralized re-export hub so consumers can import types either from
 *   the canonical feature module or from `@/types`.
 * - No domain type is duplicated across directories.
 */

// Common primitive & value object types
export type {
  CurrencyCode,
  EntityId,
  ProductImage,
  SortOrder,
  StockStatus,
} from './common';

// API envelopes, errors & pagination
export type {
  ApiError,
  ApiErrorCode,
  ApiErrorResponse,
  ApiResponse,
  ApiSuccessResponse,
  ApiValidationError,
  PaginatedResponse,
  PaginationMeta,
  PaginationParams,
} from './api';

// Products feature domain models
export type {
  PaginatedProducts,
  Product,
  ProductBadge,
  ProductQueryParams,
  ProductRating,
  ProductSortOption,
  ProductSpecification,
  ProductVariant,
  ProductVariantType,
} from '../features/products/types';

// Categories feature domain models
export type {
  Category,
  CategoryTree,
  Subcategory,
} from '../features/categories/types';

// Cart feature domain models
export type {
  CartItem,
  CartItemInput,
  CartSummary,
} from '../features/cart/types';

// Wishlist feature domain models
export type {
  PopulatedWishlistItem,
  WishlistIdentifier,
  WishlistItem,
  WishlistProductId,
  WishlistState,
} from '../features/wishlist/types';
