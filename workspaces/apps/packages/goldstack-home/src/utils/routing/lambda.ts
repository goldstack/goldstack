import manifest from './routes-manifest.json';

export const handler = (
  event: any, // biome-ignore lint/suspicious/noExplicitAny: AWS Lambda event type is complex
  context: any, // biome-ignore lint/suspicious/noExplicitAny: AWS Lambda context type is complex
  callback: any, // biome-ignore lint/suspicious/noExplicitAny: AWS Lambda callback type is complex
): void => {
  const request = event.Records[0].cf.request;

  const dynamicRoutes: any = manifest.dynamicRoutes; // biome-ignore lint/suspicious/noExplicitAny: manifest structure is dynamic

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

  callback(null, request);
};
