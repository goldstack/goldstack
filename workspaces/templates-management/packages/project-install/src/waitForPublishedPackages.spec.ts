import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import {
  collectGoldstackDependenciesFromManifest,
  collectGoldstackPackageVersions,
  type GoldstackPackageVersion,
  isExactVersion,
  type PackageManifest,
  waitForPublishedPackages,
} from './waitForPublishedPackages';

describe('Wait for published packages', () => {
  let projectDirectories: string[] = [];

  const createProjectDirectory = (packageJson: Record<string, unknown>): string => {
    const projectDirectory = mkdtempSync(path.join(tmpdir(), 'goldstack-published-packages-'));
    projectDirectories.push(projectDirectory);
    writeFileSync(path.join(projectDirectory, 'package.json'), JSON.stringify(packageJson));
    return projectDirectory;
  };

  afterEach(() => {
    for (const projectDirectory of projectDirectories) {
      rmSync(projectDirectory, { recursive: true, force: true });
    }
    projectDirectories = [];
  });

  it('Should recognise exact versions', () => {
    expect(isExactVersion('1.2.3')).toBe(true);
    expect(isExactVersion('1.2.3-beta.1')).toBe(true);
    expect(isExactVersion('^1.2.3')).toBe(false);
    expect(isExactVersion('~1.2.3')).toBe(false);
    expect(isExactVersion('workspace:*')).toBe(false);
  });

  it('Should ignore development dependencies when collecting manifest dependencies', () => {
    const dependencies = collectGoldstackDependenciesFromManifest({
      dependencies: {
        '@goldstack/one': '1.2.3',
        '@goldstack/range': '^1.0.0',
        'not-goldstack': '2.0.0',
      },
      optionalDependencies: {
        '@goldstack/two': '2.0.0',
      },
      peerDependencies: {
        '@goldstack/three': '3.0.0',
      },
      devDependencies: {
        '@goldstack/dev-only': '4.0.0',
      },
    } as PackageManifest);

    expect(dependencies).toEqual([
      { name: '@goldstack/one', version: '1.2.3' },
      { name: '@goldstack/two', version: '2.0.0' },
      { name: '@goldstack/three', version: '3.0.0' },
    ]);
  });

  it('Should collect unique Goldstack package versions from all package files', () => {
    const projectDirectory = mkdtempSync(path.join(tmpdir(), 'goldstack-published-packages-'));
    projectDirectories.push(projectDirectory);

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

  it('Should wait for transitive Goldstack dependencies of published packages', async () => {
    const projectDirectory = createProjectDirectory({
      devDependencies: {
        '@goldstack/parent': '1.0.0',
      },
    });

    const manifests = new Map<string, PackageManifest>([
      [
        '@goldstack/parent@1.0.0',
        {
          dependencies: {
            '@goldstack/child': '2.0.0',
            'some-other-package': '^1.0.0',
          },
        },
      ],
      [
        '@goldstack/child@2.0.0',
        {
          dependencies: {
            '@goldstack/grandchild': '3.0.0',
          },
        },
      ],
      ['@goldstack/grandchild@3.0.0', {}],
    ]);

    const requestedPackages: string[] = [];

    await waitForPublishedPackages({
      projectDirectory,
      retryIntervalMs: 1,
      maxWaitTimeMs: 1000,
      fetchPackageManifest: async (packageVersion: GoldstackPackageVersion) => {
        const key = `${packageVersion.name}@${packageVersion.version}`;
        requestedPackages.push(key);
        return manifests.get(key) ?? null;
      },
    });

    expect(requestedPackages.sort()).toEqual([
      '@goldstack/child@2.0.0',
      '@goldstack/grandchild@3.0.0',
      '@goldstack/parent@1.0.0',
    ]);
  });

  it('Should keep waiting when a transitive dependency is not yet published', async () => {
    const projectDirectory = createProjectDirectory({
      devDependencies: {
        '@goldstack/parent': '1.0.0',
      },
    });

    let childAttempts = 0;
    const manifests = new Map<string, PackageManifest>([
      [
        '@goldstack/parent@1.0.0',
        {
          dependencies: {
            '@goldstack/child': '2.0.0',
          },
        },
      ],
      ['@goldstack/child@2.0.0', {}],
    ]);

    const fetchPackageManifest = async (
      packageVersion: GoldstackPackageVersion,
    ): Promise<PackageManifest | null> => {
      const key = `${packageVersion.name}@${packageVersion.version}`;
      if (key === '@goldstack/child@2.0.0') {
        childAttempts++;
        if (childAttempts < 3) {
          return null;
        }
      }
      return manifests.get(key) ?? null;
    };

    await waitForPublishedPackages({
      projectDirectory,
      retryIntervalMs: 1,
      maxWaitTimeMs: 1000,
      fetchPackageManifest,
    });

    expect(childAttempts).toBe(3);
  });

  it('Should throw once the maximum wait time is exceeded', async () => {
    const projectDirectory = createProjectDirectory({
      devDependencies: {
        '@goldstack/missing': '1.0.0',
      },
    });

    await expect(
      waitForPublishedPackages({
        projectDirectory,
        retryIntervalMs: 1,
        maxWaitTimeMs: 5,
        fetchPackageManifest: async () => null,
      }),
    ).rejects.toThrow(/Goldstack packages not available in the npm registry/);
  });
});
