import type { Category, Subcategory } from '../../features/categories/types/category';
import type {
  Product,
  ProductBadge,
  ProductSpecification,
  ProductVariant,
  ProductVariantType,
} from '../../features/products/types/product';
import type { PaginatedProducts, ProductQueryParams } from '../../features/products/types/query';
import type { PaginationMeta } from '../../types/api';
import type { ProductImage, StockStatus } from '../../types/common';

/**
 * Valid stock statuses in the domain model.
 */
const VALID_STOCK_STATUSES: Set<StockStatus> = new Set([
  'in_stock',
  'low_stock',
  'out_of_stock',
  'preorder',
  'discontinued',
]);

/**
 * Valid badges in the domain model.
 */
const VALID_BADGES: Set<ProductBadge> = new Set([
  'new',
  'featured',
  'bestseller',
  'sale',
  'trending',
  'limited_edition',
  'official_warranty',
]);

/**
 * Helper to safely extract a string property from an unknown record.
 */
function getString(obj: Record<string, unknown>, key: string, fallback = ''): string {
  const val = obj[key];
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  return fallback;
}

/**
 * Helper to safely extract a number property from an unknown record.
 */
function getNumber(
  obj: Record<string, unknown>,
  key: string,
  fallback: number | undefined = undefined,
): number | undefined {
  const val = obj[key];
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

/**
 * Maps an incoming product payload (from a MERN backend, MongoDB document, or external API)
 * into a canonical, strongly-typed domain `Product`.
 */
export function mapProductDto(raw: unknown): Product {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid product DTO: expected an object');
  }

  const r = raw as Record<string, unknown>;

  // ID resolution: prefer 'id', fallback to MongoDB '_id'
  const id = getString(r, 'id') || getString(r, '_id') || 'unknown-id';

  // Name & Slug
  const name = getString(r, 'name', 'Unnamed Product');
  const slug = getString(r, 'slug') || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Descriptions
  const shortDescription = getString(r, 'shortDescription', name);
  const description = getString(r, 'description', shortDescription);

  // Pricing (PKR)
  const price = getNumber(r, 'price', 0) ?? 0;
  let salePrice = getNumber(r, 'salePrice');
  if (salePrice !== undefined && salePrice >= price) {
    salePrice = undefined;
  }

  // Taxonomy
  const categorySlug = getString(r, 'categorySlug', 'uncategorized');
  const subcategorySlug = getString(r, 'subcategorySlug', 'general');

  // Image normalization into ProductImage
  let primaryImage: ProductImage = {
    id: `img-${slug}-primary`,
    url: `/images/products/${slug}.svg`,
    altText: name,
    width: 800,
    height: 800,
    isPrimary: true,
  };

  if (r.primaryImage && typeof r.primaryImage === 'object') {
    const img = r.primaryImage as Record<string, unknown>;
    primaryImage = {
      id: getString(img, 'id', `img-${slug}-primary`),
      url: getString(img, 'url', primaryImage.url),
      altText: getString(img, 'altText') || getString(img, 'alt', name),
      width: getNumber(img, 'width', 800),
      height: getNumber(img, 'height', 800),
      isPrimary: true,
    };
  } else if (typeof r.primaryImage === 'string' && r.primaryImage) {
    primaryImage = {
      id: `img-${slug}-primary`,
      url: r.primaryImage,
      altText: name,
      width: 800,
      height: 800,
      isPrimary: true,
    };
  } else if (typeof r.image === 'string' && r.image) {
    primaryImage = {
      id: `img-${slug}-primary`,
      url: r.image,
      altText: name,
      width: 800,
      height: 800,
      isPrimary: true,
    };
  }

  // Gallery
  const gallery: ProductImage[] | undefined = Array.isArray(r.gallery)
    ? r.gallery.map((g, index) => {
        if (typeof g === 'object' && g !== null) {
          const img = g as Record<string, unknown>;
          return {
            id: getString(img, 'id', `img-${slug}-gallery-${index + 1}`),
            url: getString(img, 'url', primaryImage.url),
            altText: getString(img, 'altText') || getString(img, 'alt', `${name} view ${index + 1}`),
            width: getNumber(img, 'width', 800),
            height: getNumber(img, 'height', 800),
            isPrimary: false,
          };
        }
        return {
          id: `img-${slug}-gallery-${index + 1}`,
          url: String(g),
          altText: `${name} view ${index + 1}`,
          width: 800,
          height: 800,
          isPrimary: false,
        };
      })
    : undefined;

  // Features
  const features = Array.isArray(r.features)
    ? r.features.map((f) => String(f))
    : [];

  // Specifications
  const specifications: ProductSpecification[] = Array.isArray(r.specifications)
    ? r.specifications.map((s) => {
        if (typeof s === 'object' && s !== null) {
          const spec = s as Record<string, unknown>;
          return {
            group: getString(spec, 'group') || undefined,
            name: getString(spec, 'name', 'Spec'),
            value: getString(spec, 'value', '-'),
          };
        }
        return { name: 'Detail', value: String(s) };
      })
    : [];

  // Stock status
  const rawStock = getString(r, 'stockStatus') as StockStatus;
  const stockStatus: StockStatus = VALID_STOCK_STATUSES.has(rawStock) ? rawStock : 'in_stock';

  // Variants
  const variants: ProductVariant[] | undefined = Array.isArray(r.variants)
    ? r.variants.map((v, index) => {
        const vObj = (typeof v === 'object' && v !== null ? v : {}) as Record<string, unknown>;
        const varType = (getString(vObj, 'type') as ProductVariantType) || 'color';
        const vStock = getString(vObj, 'stockStatus') as StockStatus;
        return {
          id: getString(vObj, 'id', getString(vObj, '_id', `var-${id}-${index + 1}`)),
          name: getString(vObj, 'name', 'Option'),
          type: varType,
          value: getString(vObj, 'value', 'Default'),
          stockStatus: VALID_STOCK_STATUSES.has(vStock) ? vStock : stockStatus,
          price: getNumber(vObj, 'price'),
          salePrice: getNumber(vObj, 'salePrice'),
          sku: getString(vObj, 'sku') || undefined,
        };
      })
    : undefined;

  // Rating & Reviews
  const rating = getNumber(r, 'rating');
  const reviewCount = getNumber(r, 'reviewCount');

  // Badges
  const badges = Array.isArray(r.badges)
    ? (r.badges.filter((b) => VALID_BADGES.has(b as ProductBadge)) as ProductBadge[])
    : undefined;

  // Related products
  const relatedProductIds = Array.isArray(r.relatedProductIds)
    ? r.relatedProductIds.map((id) => String(id))
    : undefined;

  return {
    id,
    slug,
    name,
    shortDescription,
    description,
    price,
    salePrice,
    currency: 'PKR',
    brand: getString(r, 'brand', 'VYRO'),
    categorySlug,
    subcategorySlug,
    primaryImage,
    gallery: gallery && gallery.length > 0 ? gallery : undefined,
    features,
    specifications,
    variants: variants && variants.length > 0 ? variants : undefined,
    stockStatus,
    rating: rating !== undefined ? Math.min(5, Math.max(0, rating)) : undefined,
    reviewCount: reviewCount !== undefined ? Math.max(0, Math.floor(reviewCount)) : undefined,
    badges: badges && badges.length > 0 ? badges : undefined,
    relatedProductIds:
      relatedProductIds && relatedProductIds.length > 0 ? relatedProductIds : undefined,
    sku: getString(r, 'sku') || undefined,
    isFeatured: typeof r.isFeatured === 'boolean' ? r.isFeatured : undefined,
    createdAt: getString(r, 'createdAt') || undefined,
    updatedAt: getString(r, 'updatedAt') || undefined,
  };
}

/**
 * Maps an incoming subcategory payload into a domain `Subcategory`.
 */
export function mapSubcategoryDto(raw: unknown, parentCategorySlug = ''): Subcategory {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid subcategory DTO: expected an object');
  }

  const r = raw as Record<string, unknown>;
  const id = getString(r, 'id') || getString(r, '_id') || 'unknown-sub-id';
  const name = getString(r, 'name', 'Unnamed Subcategory');
  const slug = getString(r, 'slug') || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const categorySlug = getString(r, 'categorySlug', parentCategorySlug);

  return {
    id,
    slug,
    name,
    categorySlug,
    description: getString(r, 'description') || undefined,
    displayOrder: getNumber(r, 'displayOrder'),
    isFeatured: typeof r.isFeatured === 'boolean' ? r.isFeatured : undefined,
    badge: getString(r, 'badge') || undefined,
  };
}

/**
 * Maps an incoming category payload into a domain `Category`.
 */
export function mapCategoryDto(raw: unknown): Category {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid category DTO: expected an object');
  }

  const r = raw as Record<string, unknown>;
  const id = getString(r, 'id') || getString(r, '_id') || 'unknown-cat-id';
  const name = getString(r, 'name', 'Unnamed Category');
  const slug = getString(r, 'slug') || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const subcategories = Array.isArray(r.subcategories)
    ? r.subcategories.map((sub) => mapSubcategoryDto(sub, slug))
    : [];

  return {
    id,
    slug,
    name,
    description: getString(r, 'description') || undefined,
    displayOrder: getNumber(r, 'displayOrder'),
    isFeatured: typeof r.isFeatured === 'boolean' ? r.isFeatured : undefined,
    badge: getString(r, 'badge') || undefined,
    icon: getString(r, 'icon') || undefined,
    subcategories,
  };
}

/**
 * Maps a paginated product response into the standardized `PaginatedProducts` envelope.
 */
export function mapPaginatedProductsDto(
  raw: unknown,
  fallbackFilters?: ProductQueryParams,
): PaginatedProducts {
  if (Array.isArray(raw)) {
    const items = raw.map(mapProductDto);
    const pagination: PaginationMeta = {
      page: fallbackFilters?.page ?? 1,
      limit: fallbackFilters?.limit ?? items.length,
      totalItems: items.length,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    };
    return { items, pagination, appliedFilters: fallbackFilters };
  }

  if (raw && typeof raw === 'object') {
    const r = raw as Record<string, unknown>;
    const rawItems = Array.isArray(r.items) ? r.items : [];
    const items = rawItems.map(mapProductDto);

    const rawPagination = (r.pagination ?? {}) as Record<string, unknown>;
    const totalItems = getNumber(rawPagination, 'totalItems', items.length) ?? items.length;
    const page = Math.max(1, getNumber(rawPagination, 'page', fallbackFilters?.page ?? 1) ?? 1);
    const limit = Math.max(1, getNumber(rawPagination, 'limit', fallbackFilters?.limit ?? 12) ?? 12);
    const totalPages = Math.max(1, getNumber(rawPagination, 'totalPages', Math.ceil(totalItems / limit)) ?? 1);

    const pagination: PaginationMeta = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: typeof rawPagination.hasNextPage === 'boolean' ? rawPagination.hasNextPage : page < totalPages,
      hasPrevPage: typeof rawPagination.hasPrevPage === 'boolean' ? rawPagination.hasPrevPage : page > 1,
    };

    const appliedFilters = (r.appliedFilters as ProductQueryParams) ?? fallbackFilters;

    return {
      items,
      pagination,
      appliedFilters,
    };
  }

  return {
    items: [],
    pagination: {
      page: 1,
      limit: 12,
      totalItems: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
    appliedFilters: fallbackFilters,
  };
}
