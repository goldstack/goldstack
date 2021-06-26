import { getPackageConfigPaths } from './utilsConfig';

describe('Config utils', () => {
  it('Should determine package paths', () => {
    const paths = getPackageConfigPaths('./../../');
    expect(paths.length).toBeGreaterThan(0);
  });
});
