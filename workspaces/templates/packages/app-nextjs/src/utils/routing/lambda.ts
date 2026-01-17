var manifestText = require('./routes-manifest.json');

var manifest = manifestText; // JSON.parse(manifestText);

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

