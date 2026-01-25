/**
 * Cache header utilities for SSR routes
 * Provides dynamic cache control headers based on content type
 */

import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

export type CacheType = 'public' | 'private' | 'nocache';

/**
 * Cache configuration interface
 */
export interface CacheConfig {
  /** Type of caching strategy */
  cacheType: CacheType;
  /** Maximum age for public caching in seconds */
  maxAge?: number;
  /** Enable stale-while-revalidate for public content */
  staleWhileRevalidate?: number;
}

/**
 * Generates cache control headers based on cache type and configuration
 * @param cacheType - Type of caching strategy
 * @param maxAge - Maximum age in seconds for public content
 * @param staleWhileRevalidate - Time in seconds for stale content serving
 * @returns Object with cache control headers
 */
export const getCacheHeaders = (
  cacheType: CacheType,
  maxAge: number = 3600,
  staleWhileRevalidate: number = 60,
): Record<string, string> => {
  switch (cacheType) {
    case 'public':
      return {
        'Cache-Control': `public, max-age=${maxAge}${staleWhileRevalidate ? `, stale-while-revalidate=${staleWhileRevalidate}` : ''}`,
        Vary: 'Accept-Encoding',
      };

    case 'private':
      return {
        'Cache-Control': 'private, max-age=0, must-revalidate',
        Vary: 'Accept-Encoding, Cookie, Authorization',
      };

    case 'nocache':
    default:
      return {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        Vary: '*',
      };
  }
};

/**
 * Route-specific cache configurations
 * Define cache behavior for different route patterns
 */
export const routeConfigs: Record<string, CacheConfig> = {
  '/': { cacheType: 'public', maxAge: 3600 },
  '/about': { cacheType: 'public', maxAge: 3600 },
  '/contact': { cacheType: 'public', maxAge: 3600 },
  '/blog': { cacheType: 'public', maxAge: 1800, staleWhileRevalidate: 300 },
  '/blog/': { cacheType: 'public', maxAge: 1800, staleWhileRevalidate: 300 },
  '/dashboard': { cacheType: 'private' },
  '/profile': { cacheType: 'private' },
  '/admin': { cacheType: 'nocache' },
  '/api': { cacheType: 'nocache' },
  '/auth': { cacheType: 'nocache' },
  '/login': { cacheType: 'nocache' },
  '/logout': { cacheType: 'nocache' },
};

/**
 * Gets cache headers for a specific path
 * @param path - Request path
 * @returns Cache headers object
 */
export const getRouteCacheHeaders = (path: string): Record<string, string> => {
  const config = getRouteConfig(path);
  return getCacheHeaders(config.cacheType, config.maxAge, config.staleWhileRevalidate);
};

/**
 * Gets cache configuration for a specific path
 * @param path - Request path
 * @returns Cache configuration
 */
export const getRouteConfig = (path: string): CacheConfig => {
  // Check for exact match first
  if (routeConfigs[path]) {
    return routeConfigs[path];
  }

  // Check for prefix matches
  const prefixMatch = Object.entries(routeConfigs).find(
    ([pattern]) => path.startsWith(pattern) && !path.includes('.'),
  );

  if (prefixMatch) {
    return prefixMatch[1];
  }

  // Default to no cache for unspecified routes
  return { cacheType: 'nocache' };
};

/**
 * Determines if a route requires authentication
 * @param path - Request path
 * @returns True if authentication is required
 */
export const requiresAuthentication = (path: string): boolean => {
  const config = getRouteConfig(path);
  return config.cacheType === 'private' || config.cacheType === 'nocache';
};

/**
 * Utility to add cache headers to API Gateway response
 * @param response - Base API Gateway response
 * @param path - Request path for cache determination
 * @returns Response with cache headers added
 */
export const addCacheHeaders = (
  response: APIGatewayProxyStructuredResultV2,
  path: string,
): APIGatewayProxyStructuredResultV2 => {
  const cacheHeaders = getRouteCacheHeaders(path);

  return {
    ...response,
    headers: {
      ...response.headers,
      'Content-Type': response.headers?.['Content-Type'] || 'text/html',
      ...cacheHeaders,
    },
  };
};
