import routes from '../utils/routing/routes-manifest.json';

it('Should match a route', () => {
  const request = {
    uri: '/docs/modules/app-nextjs',
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

  expect(request.uri).toEqual('/docs/modules/app-nextjs.html');
});
