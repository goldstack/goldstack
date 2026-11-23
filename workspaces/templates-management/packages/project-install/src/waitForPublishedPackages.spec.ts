import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { collectGoldstackPackageVersions, isExactVersion } from './waitForPublishedPackages';

describe('Wait for published packages', () => {
  it('Should recognise exact versions', () => {
    expect(isExactVersion('1.2.3')).toBe(true);
    expect(isExactVersion('1.2.3-beta.1')).toBe(true);
    expect(isExactVersion('^1.2.3')).toBe(false);
    expect(isExactVersion('~1.2.3')).toBe(false);
    expect(isExactVersion('workspace:*')).toBe(false);
  });

  it('Should collect unique Goldstack package versions from all package files', () => {
    const projectDirectory = mkdtempSync(path.join(tmpdir(), 'goldstack-published-packages-'));

    try {
      const writePackageJson = (directory: string, packageJson: Record<string, unknown>): void => {
        mkdirSync(directory, { recursive: true });
        writeFileSync(path.join(directory, 'package.json'), JSON.stringify(packageJson));
      };

      writePackageJson(projectDirectory, {
        dependencies: {
          '@goldstack/one': '1.2.3',
          '@goldstack/range': '^1.0.0',
          'not-goldstack': '2.0.0',
        },
        devDependencies: {
          '@goldstack/two': '2.0.0',
        },
      });
      writePackageJson(path.join(projectDirectory, 'packages/one'), {
        dependencies: {
          '@goldstack/one': '1.2.3',
        },
        optionalDependencies: {
          '@goldstack/three': '3.0.0',
        },
      });
      writePackageJson(path.join(projectDirectory, 'packages/two'), {
        peerDependencies: {
          '@goldstack/four': '4.0.0',
        },
      });
      writePackageJson(path.join(projectDirectory, 'node_modules/ignored'), {
        dependencies: {
          '@goldstack/ignored': '5.0.0',
        },
      });

      const packages = collectGoldstackPackageVersions(projectDirectory)
        .map((packageVersion) => `${packageVersion.name}@${packageVersion.version}`)
        .sort();

      expect(packages).toEqual([
        '@goldstack/four@4.0.0',
        '@goldstack/one@1.2.3',
        '@goldstack/three@3.0.0',
        '@goldstack/two@2.0.0',
      ]);
    } finally {
      rmSync(projectDirectory, { recursive: true, force: true });
    }
  });
});
