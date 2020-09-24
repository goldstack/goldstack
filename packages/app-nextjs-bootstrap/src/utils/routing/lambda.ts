import manifest from './routes-manifest.json';

export const handler = (event: any, context: any, callback: any): void => {
  const request = event.Records[0].cf.request;

  const dynamicRoutes: any = manifest.dynamicRoutes;

  for (const route of dynamicRoutes) {
    if (new RegExp(route.regex).test(request.uri)) {
      request.uri = route.page;
      break;
    }
  }

  if (!request.uri.endsWith('.html')) {
    request.uri = request.uri + '.html';
  }

  callback(null, request);
};
