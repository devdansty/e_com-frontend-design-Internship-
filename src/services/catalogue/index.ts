export type { CatalogueService } from './catalogue-service.interface';
export { MockCatalogueService, mockCatalogueService } from './mock-catalogue-service';
export { HttpCatalogueService } from './http-catalogue-service';
export {
  createCatalogueService,
  getCatalogueService,
  setCatalogueService,
  resetCatalogueService,
  catalogueService,
} from './catalogue-factory';
export {
  resolveCatalogueConfig,
  type CatalogueServiceConfig,
  type DataSourceMode,
} from './catalogue-config';
export {
  mapProductDto,
  mapCategoryDto,
  mapSubcategoryDto,
  mapPaginatedProductsDto,
} from './catalogue-mapper';
export {
  effectivePrice,
  matchesSearch,
  matchesCategory,
  matchesSubcategory,
  matchesPriceRange,
  matchesStockStatus,
  matchesBadges,
  matchesFeatured,
  applyFilters,
  applySorting,
  buildSortComparator,
  applyPagination,
  buildPaginationMeta,
  normalizePaginationParams,
} from './catalogue-helpers';
