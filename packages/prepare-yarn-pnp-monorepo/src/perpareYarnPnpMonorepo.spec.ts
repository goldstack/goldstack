import { cp, mkdir, write, read, pwd } from '@goldstack/utils-sh';

import { removeNpmRegistry } from './perpareYarnPnpMonorepo';

describe('Prepare Yarn monorepo', () => {
  it('Should remove yarn registries', () => {
    const yarnRc = read('./../../../../.yarnrc.yml');
    const res = removeNpmRegistry({ yarnRc });

    console.log(res);
    expect(res).not.toContain('npmAuthToken:');
    expect(res).not.toContain('npmRegistries:');
  });
});
