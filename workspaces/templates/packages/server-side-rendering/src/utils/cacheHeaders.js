/**
 * Cache header utilities for SSR routes
 * Provides dynamic cache control headers based on content type
 */
/**
 * Generates cache control headers based on cache type and configuration
 * @param cacheType - Type of caching strategy
 * @param maxAge - Maximum age in seconds for public content
 * @param staleWhileRevalidate - Time in seconds for stale content serving
 * @returns Object with cache control headers
 */
export const getCacheHeaders = (cacheType, maxAge = 3600, staleWhileRevalidate = 60) => {
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
export const routeConfigs = {
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
export const getRouteCacheHeaders = (path) => {
  const config = getRouteConfig(path);
  return getCacheHeaders(config.cacheType, config.maxAge, config.staleWhileRevalidate);
};
/**
 * Gets cache configuration for a specific path
 * @param path - Request path
 * @returns Cache configuration
 */
export const getRouteConfig = (path) => {
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
export const requiresAuthentication = (path) => {
  const config = getRouteConfig(path);
  return config.cacheType === 'private' || config.cacheType === 'nocache';
};
/**
 * Utility to add cache headers to API Gateway response
 * @param response - Base API Gateway response
 * @param path - Request path for cache determination
 * @returns Response with cache headers added
 */
export const addCacheHeaders = (response, path) => {
  var _a;
  const cacheHeaders = getRouteCacheHeaders(path);
  return {
    ...response,
    headers: {
      ...response.headers,
      'Content-Type':
        ((_a = response.headers) === null || _a === void 0 ? void 0 : _a['Content-Type']) ||
        'text/html',
      ...cacheHeaders,
    },
  };
};
//# sourceMappingURL=cacheHeaders.js.map
