import routes from '../utils/routing/routes-manifest.json';

it('Should match a route', () => {
  const request = {
    uri: '/docs/templates/app-nextjs',
  };

  const extension =
    request.uri.indexOf('.') !== -1 ? request.uri.split('.').pop() : '.html';
  const dynamicRoutes = routes.dynamicRoutes;
  for (const route of dynamicRoutes) {
    if (new RegExp(route.regex).test(request.uri)) {
      request.uri = route.page + extension;
      break;
    }
  }

  expect(request.uri).toEqual('/docs/templates/app-nextjs.html');
});
