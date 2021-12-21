import { constructRouteMap } from 'auto-cdk/lib/routes';
import { constructResourceMap } from 'auto-cdk/lib/resources';
import { Config } from 'auto-cdk/lib/config';

describe('Lambda utils', () => {
  it('Should obtain config from files', async () => {
    const config = new Config();
    const routeMap = await constructRouteMap('./testData/routes', config);

    console.log(routeMap);

    const resourceMap = constructResourceMap(
      routeMap,
      './goldstackLocal',
      config
    );

    console.log(JSON.stringify(resourceMap, null, 2));
  });
});
