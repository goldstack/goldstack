import type { CloudFrontRequestEvent, Context, CloudFrontRequestCallback } from 'aws-lambda';
import manifest from './routes-manifest.json';

interface DynamicRoute {
  page: string;
  regex: string;
  routeKeys?: Record<string, string>;
  namedRegex?: string;
}

export const handler = (
  event: CloudFrontRequestEvent,
  context: Context,
  callback: CloudFrontRequestCallback,
): void => {
  const request = event.Records[0].cf.request;

  const dynamicRoutes: DynamicRoute[] = manifest.dynamicRoutes;

  const extension =
    request.uri.indexOf('.') !== -1 ? (request.uri.split('.').pop() as string) : '.html';

  for (const route of dynamicRoutes) {
    if (new RegExp(route.regex).test(request.uri)) {
      request.uri = route.page + extension;
      break;
    }
  }

  if (request.uri.indexOf(extension) === -1) {
    request.uri = request.uri + extension;
  }

  callback(null, request);
};
