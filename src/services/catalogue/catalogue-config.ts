/**
 * Supported data source execution modes.
 */
export type DataSourceMode = 'mock' | 'http';

/**
 * Configuration options for the catalogue service factory.
 */
export interface CatalogueServiceConfig {
  /**
   * Execution mode: 'mock' (default) or 'http'.
   */
  mode?: DataSourceMode;

  /**
   * Base URL for the MERN / REST API backend when in 'http' mode.
   * e.g. 'http://localhost:5000/api' or '/api'.
   */
  apiBaseUrl?: string;

  /**
   * Request timeout in milliseconds. Defaults to 10,000ms.
   */
  timeoutMs?: number;

  /**
   * Custom fetch implementation (useful for tests and mocking).
   */
  fetchFn?: typeof fetch;
}

/**
 * Resolves the active catalogue configuration from environment variables
 * (`import.meta.env`) with safe, static defaults.
 *
 * Defaults:
 * - `mode`: 'mock' (Application works completely standalone with no backend).
 * - `apiBaseUrl`: 'http://localhost:5000/api'
 * - `timeoutMs`: 10000
 */
export function resolveCatalogueConfig(
  overrides: CatalogueServiceConfig = {},
): Required<Omit<CatalogueServiceConfig, 'fetchFn'>> & { fetchFn?: typeof fetch } {
  // Safe environment lookup that won't throw in test/node environments
  const envDataSource =
    typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_DATA_SOURCE as string | undefined)
      : undefined;

  const envApiBaseUrl =
    typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_API_BASE_URL as string | undefined)
      : undefined;

  const envTimeout =
    typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_API_TIMEOUT_MS as string | undefined)
      : undefined;

  const resolvedMode: DataSourceMode =
    overrides.mode ??
    (envDataSource?.toLowerCase() === 'http' ? 'http' : 'mock');

  const resolvedBaseUrl =
    overrides.apiBaseUrl ??
    envApiBaseUrl ??
    'http://localhost:5000/api';

  const resolvedTimeout =
    overrides.timeoutMs ??
    (envTimeout ? parseInt(envTimeout, 10) : 10000);

  return {
    mode: resolvedMode,
    apiBaseUrl: resolvedBaseUrl,
    timeoutMs: Number.isNaN(resolvedTimeout) ? 10000 : resolvedTimeout,
    fetchFn: overrides.fetchFn,
  };
}
