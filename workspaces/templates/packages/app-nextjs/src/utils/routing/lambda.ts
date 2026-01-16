import manifest from './routes-manifest.json';

interface DynamicRoute {
  page: string;
  regex: string;
  routeKeys?: Record<string, string>;
  namedRegex?: string;
}

interface CloudFrontRequest {
  method: string;
  uri: string;
  querystring: Record<string, unknown>;
  headers: Record<string, unknown>;
  cookies: Record<string, unknown>;
}

interface CloudFrontRequestEvent {
  version: string;
  context: {
    distributionDomainName?: string;
    endpoint?: string;
    distributionId: string;
    eventType: string;
    requestId: string;
  };
  viewer: {
    ip: string;
  };
  request: CloudFrontRequest;
}

export const handler = (event: CloudFrontRequestEvent) => {
  const request = event.request;

  const dynamicRoutes: DynamicRoute[] = manifest.dynamicRoutes as any;

  const extension =
    request.uri.indexOf('.') !== -1 ? (request.uri.split('.').pop() as string) : '.html';

  for (const route of dynamicRoutes) {
    if (new RegExp(route.regex).test(request.uri)) {
      if (route.page === '/') {
        request.uri = '/index.html';
      } else {
        request.uri = route.page + extension;
      }
      break;
    }
  }

  if (request.uri.indexOf(extension) === -1) {
    request.uri = request.uri + extension;
  }

  return request;
};
