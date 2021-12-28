import assert from 'assert';
import { readLambdaConfig } from './collectLambdasFromFiles';

describe('Lambda utils', () => {
  it('Should obtain config from files', async () => {
    const routes = readLambdaConfig('./testData/routes');
    assert(!!routes.find((e) => e.route === '$default'));
    assert(!!routes.find((e) => e.route === 'ANY /bird/abilities'));
    assert(!!routes.find((e) => e.route === 'ANY /'));
    assert(!!routes.find((e) => e.route === 'ANY /bird'));
    assert(
      routes.find((e) => e.route === 'ANY /bird')?.relativePath === 'bird.ts'
    );
    assert(routes.find((e) => e.route === 'ANY /bird')?.name === 'bird');
  });
});
