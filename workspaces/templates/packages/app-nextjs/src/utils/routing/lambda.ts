import manifest from './routes-manifest.json';

interface DynamicRoute {
  page: string;
  regex: string;
  routeKeys?: Record<string, string>;
  namedRegex?: string;
}

interface CloudFrontRequestEvent {
  request: {
    uri: string;
    [key: string]: any;
  };
}

function handler(event: CloudFrontRequestEvent) {
  const request = event.request;

  const dynamicRoutes: DynamicRoute[] = manifest.dynamicRoutes;

  // Determine file extension - default to .html for routes without extension
  const extension = request.uri.indexOf('.') !== -1 ? request.uri.split('.').pop() : 'html';

  // Check dynamic routes
  for (const route of dynamicRoutes) {
    if (new RegExp(route.regex).test(request.uri)) {
      if (route.page === '/') {
        request.uri = 'index.html';
      } else {
        request.uri = `${route.page}.${extension}`;
      }
      break;
    }
  }

  // If URI doesn't have an extension and is not already index.html, add .html
  if (request.uri.indexOf('.') === -1 && request.uri !== 'index.html') {
    request.uri = `${request.uri}.html`;
  }

  // Handle trailing slash redirects
  if (request.uri.endsWith('/') && request.uri !== '/') {
    request.uri = `${request.uri.slice(0, -1)}.html`;
  }

  return request;
}

export { handler };
