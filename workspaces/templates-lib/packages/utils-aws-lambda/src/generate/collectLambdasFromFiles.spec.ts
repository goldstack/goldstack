import assert from 'assert';
import { readLambdaConfig } from './collectLambdasFromFiles';

describe('Lambda utils', () => {
  const routes = readLambdaConfig('./testData/routes');
  it('Should obtain config from files', async () => {
    assert(!!routes.find((e) => e.route === '$default'));
    assert(!!routes.find((e) => e.route === 'ANY /bird/abilities'));
    assert(!!routes.find((e) => e.route === 'ANY /'));
    assert(!!routes.find((e) => e.route === 'ANY /bird'));
    assert(routes.find((e) => e.route === 'ANY /bird')?.relativeFilePath === 'bird.ts');
    assert(routes.find((e) => e.route === 'ANY /bird')?.name === 'bird');
  });
  it('Should be able to handle index files', async () => {
    // console.log(JSON.stringify(routes, null, 2));
    const indexRoute = routes.find((e) => e.route === 'ANY /dog');
    assert(indexRoute !== undefined);
  });
});
