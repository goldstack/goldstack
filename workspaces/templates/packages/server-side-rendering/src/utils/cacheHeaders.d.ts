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
export declare const getCacheHeaders: (
  cacheType: CacheType,
  maxAge?: number,
  staleWhileRevalidate?: number,
) => Record<string, string>;
/**
 * Route-specific cache configurations
 * Define cache behavior for different route patterns
 */
export declare const routeConfigs: Record<string, CacheConfig>;
/**
 * Gets cache headers for a specific path
 * @param path - Request path
 * @returns Cache headers object
 */
export declare const getRouteCacheHeaders: (path: string) => Record<string, string>;
/**
 * Gets cache configuration for a specific path
 * @param path - Request path
 * @returns Cache configuration
 */
export declare const getRouteConfig: (path: string) => CacheConfig;
/**
 * Determines if a route requires authentication
 * @param path - Request path
 * @returns True if authentication is required
 */
export declare const requiresAuthentication: (path: string) => boolean;
/**
 * Utility to add cache headers to API Gateway response
 * @param response - Base API Gateway response
 * @param path - Request path for cache determination
 * @returns Response with cache headers added
 */
export declare const addCacheHeaders: (
  response: APIGatewayProxyStructuredResultV2,
  path: string,
) => APIGatewayProxyStructuredResultV2;
//# sourceMappingURL=cacheHeaders.d.ts.map
