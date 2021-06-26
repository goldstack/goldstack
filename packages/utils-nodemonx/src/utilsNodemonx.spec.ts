import { getNearestPackageJson } from './utilsNodemonx';
import path from 'path';

describe('nodemonx', () => {
  it('Should find package.json', () => {
    const packageJson = getNearestPackageJson('.');
    expect(packageJson).toEqual('./package.json');

    const packageJsonAbs = getNearestPackageJson(path.resolve('.'));
    expect(packageJsonAbs.indexOf('package.json') > -1).toBeTruthy();

    const packageJsonParent = getNearestPackageJson(path.resolve('./../'));
    expect(
      packageJsonParent.indexOf(
        path.basename(path.dirname(path.resolve('.')))
      ) === -1
    ).toBeTruthy();
  });
});
