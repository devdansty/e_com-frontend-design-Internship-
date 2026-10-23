import {
  resolveCatalogueConfig,
  type CatalogueServiceConfig,
} from './catalogue-config';
import type { CatalogueService } from './catalogue-service.interface';
import { HttpCatalogueService } from './http-catalogue-service';
import { MockCatalogueService } from './mock-catalogue-service';

/**
 * Instantiates a concrete `CatalogueService` implementation based on the supplied
 * or environment-resolved configuration.
 *
 * @param config Optional configuration overrides.
 * @returns An instance of `CatalogueService` (MockCatalogueService or HttpCatalogueService).
 */
export function createCatalogueService(config?: CatalogueServiceConfig): CatalogueService {
  const resolved = resolveCatalogueConfig(config);

  if (resolved.mode === 'http') {
    return new HttpCatalogueService({
      baseUrl: resolved.apiBaseUrl,
      timeoutMs: resolved.timeoutMs,
      fetchFn: resolved.fetchFn,
    });
  }

  return new MockCatalogueService();
}

/**
 * Internal reference to the active global CatalogueService instance.
 * Defaults to mock mode for guaranteed out-of-the-box offline functionality.
 */
let activeService: CatalogueService = createCatalogueService();

/**
 * Returns the currently active global CatalogueService instance.
 */
export function getCatalogueService(): CatalogueService {
  return activeService;
}

/**
 * Replaces the currently active global CatalogueService instance.
 * Useful for runtime mode changes, testing, or dependency injection.
 */
export function setCatalogueService(service: CatalogueService): void {
  activeService = service;
}

/**
 * Resets the active CatalogueService to the environment-configured default.
 */
export function resetCatalogueService(config?: CatalogueServiceConfig): void {
  activeService = createCatalogueService(config);
}

/**
 * Canonical singleton service instance for application-wide consumption.
 * Dispatches all calls through `getCatalogueService()` so dynamic swaps via
 * `setCatalogueService()` take effect everywhere immediately.
 */
export const catalogueService: CatalogueService = {
  getProducts: (params) => getCatalogueService().getProducts(params),
  getProductBySlug: (slug) => getCatalogueService().getProductBySlug(slug),
  getCategories: () => getCatalogueService().getCategories(),
  getCategoryBySlug: (slug) => getCatalogueService().getCategoryBySlug(slug),
  getRelatedProducts(slug) {
    return getCatalogueService().getRelatedProducts(slug);
  },
};
