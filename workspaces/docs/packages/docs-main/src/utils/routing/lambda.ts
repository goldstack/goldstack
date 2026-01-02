import manifest from './routes-manifest.json';

// import nextConfig from './../../../next.config.js';

export const handler = (event: any, _context: any, callback: any): void => {
  const request = event.Records[0].cf.request;

  const dynamicRoutes: any = manifest.dynamicRoutes;

  const extension = request.uri.indexOf('.') !== -1 ? request.uri.split('.').pop() : '.html';

  for (const route of dynamicRoutes) {
    if (new RegExp(route.regex).test(request.uri)) {
      request.uri = route.page + extension;
      break;
    }
  }

  if (request.uri.indexOf(extension) === -1) {
    request.uri = request.uri + extension;
  }

  // if (nextConfig.redirects) {
  //   const redirects = nextConfig.redirects();
  // }

  callback(null, request);
};
