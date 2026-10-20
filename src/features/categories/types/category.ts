import type { ProductImage } from '../../../types/common';

/**
 * Secondary taxonomic grouping under a primary merchandise category.
 * Example: 'tws-earbuds' or 'headphones' under 'audio'.
 */
export interface Subcategory {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  description?: string;
  image?: ProductImage | string;
  productCount?: number;
  displayOrder?: number;
  badge?: string;
  isFeatured?: boolean;
}

/**
 * Primary product category in the catalog taxonomy.
 * Example: 'audio', 'wearables', 'chargers-power', 'smart-home'.
 */
export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image?: ProductImage | string;
  icon?: string;
  badge?: string;
  subcategories: Subcategory[];
  productCount?: number;
  isFeatured?: boolean;
  displayOrder?: number;
}

/**
 * Tree representation of the full category hierarchy.
 */
export type CategoryTree = Category[];
