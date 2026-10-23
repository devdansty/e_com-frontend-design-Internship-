import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createCatalogueService,
  getCatalogueService,
  resetCatalogueService,
  setCatalogueService,
  catalogueService,
} from './catalogue-factory';
import { MockCatalogueService } from './mock-catalogue-service';
import { HttpCatalogueService } from './http-catalogue-service';
import { resolveCatalogueConfig } from './catalogue-config';
import type { CatalogueService } from './catalogue-service.interface';

describe('catalogue-factory & configuration', () => {
  beforeEach(() => {
    resetCatalogueService();
  });

  afterEach(() => {
    resetCatalogueService();
  });

  describe('resolveCatalogueConfig', () => {
    it('defaults to mock mode and standard development base URL', () => {
      const config = resolveCatalogueConfig();
      expect(config.mode).toBe('mock');
      expect(config.apiBaseUrl).toBe('http://localhost:5000/api');
      expect(config.timeoutMs).toBe(10000);
    });

    it('honors config overrides', () => {
      const config = resolveCatalogueConfig({
        mode: 'http',
        apiBaseUrl: 'https://api.vyro.pk/api',
        timeoutMs: 5000,
      });

      expect(config.mode).toBe('http');
      expect(config.apiBaseUrl).toBe('https://api.vyro.pk/api');
      expect(config.timeoutMs).toBe(5000);
    });
  });

  describe('createCatalogueService', () => {
    it('returns a MockCatalogueService by default (no running backend required)', () => {
      const service = createCatalogueService();
      expect(service).toBeInstanceOf(MockCatalogueService);
    });

    it('returns a MockCatalogueService when mode is explicitly "mock"', () => {
      const service = createCatalogueService({ mode: 'mock' });
      expect(service).toBeInstanceOf(MockCatalogueService);
    });

    it('returns an HttpCatalogueService when mode is "http"', () => {
      const service = createCatalogueService({ mode: 'http' });
      expect(service).toBeInstanceOf(HttpCatalogueService);
    });

    it('configures HttpCatalogueService with custom base URL', () => {
      const service = createCatalogueService({
        mode: 'http',
        apiBaseUrl: 'https://api.vyro.pk/api',
      }) as HttpCatalogueService;

      expect(service).toBeInstanceOf(HttpCatalogueService);
      expect(service.getHttpClient().getBaseUrl()).toBe('https://api.vyro.pk/api');
    });
  });

  describe('service selection and active singleton', () => {
    it('getCatalogueService() defaults to MockCatalogueService', () => {
      expect(getCatalogueService()).toBeInstanceOf(MockCatalogueService);
    });

    it('setCatalogueService() replaces the active global service', () => {
      const mockCustomService: CatalogueService = {
        getProducts: vi.fn(),
        getProductBySlug: vi.fn(),
        getCategories: vi.fn(),
        getCategoryBySlug: vi.fn(),
        getRelatedProducts: vi.fn(),
      };

      setCatalogueService(mockCustomService);
      expect(getCatalogueService()).toBe(mockCustomService);
    });

    it('resetCatalogueService() restores the configured default', () => {
      const mockCustomService: CatalogueService = {
        getProducts: vi.fn(),
        getProductBySlug: vi.fn(),
        getCategories: vi.fn(),
        getCategoryBySlug: vi.fn(),
        getRelatedProducts: vi.fn(),
      };

      setCatalogueService(mockCustomService);
      expect(getCatalogueService()).toBe(mockCustomService);

      resetCatalogueService();
      expect(getCatalogueService()).toBeInstanceOf(MockCatalogueService);
    });

    it('catalogueService singleton delegates calls dynamically to active service', async () => {
      const getProductsSpy = vi.fn().mockResolvedValue({
        items: [],
        pagination: {
          page: 1,
          limit: 12,
          totalItems: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      const customService: CatalogueService = {
        getProducts: getProductsSpy,
        getProductBySlug: vi.fn().mockResolvedValue(undefined),
        getCategories: vi.fn().mockResolvedValue([]),
        getCategoryBySlug: vi.fn().mockResolvedValue(undefined),
        getRelatedProducts: vi.fn().mockResolvedValue([]),
      };

      setCatalogueService(customService);

      // Invoke through singleton export
      await catalogueService.getProducts({ page: 2 });
      expect(getProductsSpy).toHaveBeenCalledWith({ page: 2 });
    });
  });
});
