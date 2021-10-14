import { read } from '@goldstack/utils-sh';

import { removeNpmRegistry } from './perpareYarnPnpMonorepo';

describe('Prepare Yarn monorepo', () => {
  it('Should remove yarn registries', () => {
    const yarnRc = read('./../../../../.yarnrc.yml');
    const res = removeNpmRegistry({ yarnRc });

    expect(res).not.toContain('npmAuthToken:');
    expect(res).not.toContain('npmRegistries:');
  });
});
