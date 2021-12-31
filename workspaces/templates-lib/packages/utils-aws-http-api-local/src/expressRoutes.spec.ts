import { gatewayRouteToExpressPath } from './expressRoutes';

describe('Should create express routes correctly', () => {
  it('Should deal with parameters', () => {
    expect(gatewayRouteToExpressPath('/hello/{param1}')).toEqual(
      '/hello/:param1'
    );
    expect(gatewayRouteToExpressPath('/hello/{param1}/furtherpath')).toEqual(
      '/hello/:param1/furtherpath'
    );
    expect(gatewayRouteToExpressPath('/hello/{greedy+}')).toEqual(
      '/hello/:greedy*'
    );
  });
});
