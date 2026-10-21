import type { PaginatedResponse } from '../../../types/api';
import type { SortOrder, StockStatus } from '../../../types/common';
import type { Product, ProductBadge } from './product';

/**
 * Supported sorting presets for product catalog browsing.
 */
export type ProductSortOption =
  | 'featured'
  | 'price_asc'
  | 'price_desc'
  | 'rating_desc'
  | 'newest'
  | 'name_asc'
  | 'name_desc';

/**
 * Filter and search criteria for catalog queries.
 */
export interface ProductQueryParams {
  categorySlug?: string;
  subcategorySlug?: string;
  search?: string;
  brand?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  stockStatus?: StockStatus | StockStatus[];
  badges?: ProductBadge[];
  sortBy?: ProductSortOption;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
  inStockOnly?: boolean;
  isFeatured?: boolean;
}

/**
 * Paginated products result structure including query metadata.
 */
export interface PaginatedProducts extends PaginatedResponse<Product> {
  appliedFilters?: ProductQueryParams;
}
