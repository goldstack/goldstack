import { read } from '@goldstack/utils-sh';

import { removeNpmRegistry } from './perpareYarnPnpMonorepo';

describe('Prepare Yarn monorepo', () => {
  it('Should remove yarn registries', () => {
    const yarnRc = read('./../../../../.yarnrc.yml');
    const res = removeNpmRegistry({ yarnRc });

    expect(res).not.toContain('npmAuthToken:');
    expect(res).not.toContain('npmRegistries:');

    // The root configuration must never contain registry credentials, otherwise
    // they shadow the token supplied by the CI environment and publishing fails.
    expect(yarnRc).not.toContain('npmAuthToken:');
    expect(yarnRc).not.toContain('npmRegistries:');
  });
});
