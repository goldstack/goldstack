import { readLambdaConfig } from './collectLambdasFromFiles';

describe('Lambda utils', () => {
  it('Should obtain config from files', async () => {
    const routes = readLambdaConfig('./testData/routes');
    expect(routes.find((e) => e.route === 'bird/abilities'));
    expect(routes.find((e) => e.route === '$default'));
    expect(routes.find((e) => e.route === '/'));
    expect(routes.find((e) => e.route === 'bird'));
    expect(routes.find((e) => e.route === 'bird')?.relativePath === 'bird.ts');
    expect(routes.find((e) => e.route === 'bird')?.name === 'bird.ts');
    console.log(routes);
  });
});
