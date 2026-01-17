var manifest = require('./routes-manifest.json');

/**
 * We are using a outdated syntax here, since we are bundling with esbuild and that cannot translate into es5. So
 * we want to make its job as easy as possible.
 *
 * Cloudfront functions likes these strange non-exported handler functions, so that's what we are supplying. Note
 * you can also make this async by adding 'async' before the function declaration.
 */
function handler(event) {
  var request = event.request;

  var dynamicRoutes = manifest.dynamicRoutes;

  var extension = request.uri.indexOf('.') !== -1 ? request.uri.split('.').pop() : '.html';

  var i;
  var route;

  for (i = 0; i < dynamicRoutes.length; i++) {
    route = dynamicRoutes[i];
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
}
