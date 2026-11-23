import { debug, info, warn } from '@goldstack/utils-log';
import { read } from '@goldstack/utils-sh';
import { readdirSync, statSync } from 'fs';
import path from 'path';

const DEFAULT_RETRY_INTERVAL_MS = 60 * 1000;
const DEFAULT_MAX_WAIT_TIME_MS = 30 * 60 * 1000;
const REGISTRY_URL = 'https://registry.npmjs.org';
const REGISTRY_ACCEPT_HEADER = 'application/vnd.npm.install-v1+json';
const GOLDSTACK_PACKAGE_PREFIX = '@goldstack/';

const ignoredDirectories = new Set(['.git', '.yarn', '.cache', 'node_modules']);

const exactVersionRegex = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-.]+)?$/;

/**
 * Dependency types of a project package.json that are installed by Yarn.
 */
const projectDependencyTypes = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
];

/**
 * Dependency types of a published package that can pull in further Goldstack packages.
 */
const transitiveDependencyTypes = ['dependencies', 'optionalDependencies', 'peerDependencies'];

/**
 * Name and version of a package that needs to be available in the npm registry.
 */
export interface GoldstackPackageVersion {
  /**
   * Name of the package, for instance `@goldstack/utils-sh`.
   */
  name: string;

  /**
   * Exact version of the package that needs to be available, for instance `0.5.50`.
   */
  version: string;
}

/**
 * Minimal subset of a package manifest that is required to discover further Goldstack dependencies.
 */
export interface PackageManifest {
  /**
   * Packages the manifest depends on.
   */
  dependencies?: Record<string, string>;

  /**
   * Packages the manifest optionally depends on.
   */
  optionalDependencies?: Record<string, string>;

  /**
   * Packages the manifest expects to be provided by its consumer.
   */
  peerDependencies?: Record<string, string>;
}

/**
 * Parameters for waiting until all Goldstack packages used by a project have been published.
 */
export interface WaitForPublishedPackagesParams {
  /**
   * Directory of the project that should be installed.
   */
  projectDirectory: string;

  /**
   * Time in milliseconds between checks of the npm registry. Defaults to one minute.
   */
  retryIntervalMs?: number;

  /**
   * Maximum time in milliseconds to wait for all packages to be published. Defaults to 30 minutes.
   */
  maxWaitTimeMs?: number;

  /**
   * Optional function used to look up a package version in the npm registry. Intended for tests.
   */
  fetchPackageManifest?: (
    packageVersion: GoldstackPackageVersion,
  ) => Promise<PackageManifest | null>;
}

/**
 * Determine whether a version string refers to one exact version as opposed to a semver range.
 *
 * @param version version string from a dependency declaration
 * @returns true if the version is an exact version
 */
export function isExactVersion(version: string): boolean {
  return exactVersionRegex.test(version);
}

function isGoldstackDependency(name: string, version: string): boolean {
  return name.startsWith(GOLDSTACK_PACKAGE_PREFIX) && isExactVersion(version);
}

function packageKey(packageVersion: GoldstackPackageVersion): string {
  return `${packageVersion.name}@${packageVersion.version}`;
}

function extractGoldstackDependencies(
  manifest: Record<string, unknown>,
  dependencyTypes: string[],
): GoldstackPackageVersion[] {
  const dependencies: GoldstackPackageVersion[] = [];

  for (const dependencyType of dependencyTypes) {
    const dependencySet = manifest[dependencyType] as Record<string, string> | undefined;
    if (!dependencySet) {
      continue;
    }
    for (const [name, version] of Object.entries(dependencySet)) {
      if (!isGoldstackDependency(name, version)) {
        continue;
      }
      dependencies.push({ name, version });
    }
  }

  return dependencies;
}

function readPackageJsonDependencies(packageJsonPath: string): GoldstackPackageVersion[] {
  const packageJson = JSON.parse(read(packageJsonPath)) as Record<string, unknown>;
  return extractGoldstackDependencies(packageJson, projectDependencyTypes);
}

/**
 * Collect the Goldstack dependencies listed in the manifest of a published package.
 *
 * Only dependencies that are installed for consumers are considered. Development dependencies of
 * published packages are not installed and are therefore ignored.
 *
 * @param manifest manifest of a published package
 * @returns Goldstack dependencies declared by the manifest
 */
export function collectGoldstackDependenciesFromManifest(
  manifest: PackageManifest,
): GoldstackPackageVersion[] {
  return extractGoldstackDependencies(
    manifest as Record<string, unknown>,
    transitiveDependencyTypes,
  );
}

function findPackageJsonFiles(directory: string): string[] {
  const packageJsonFiles: string[] = [];

  for (const entry of readdirSync(directory)) {
    const entryPath = path.join(directory, entry);
    if (statSync(entryPath).isDirectory()) {
      if (ignoredDirectories.has(entry)) {
        continue;
      }
      packageJsonFiles.push(...findPackageJsonFiles(entryPath));
      continue;
    }
    if (entry === 'package.json') {
      packageJsonFiles.push(entryPath);
    }
  }

  return packageJsonFiles;
}

/**
 * Collect all Goldstack package versions referenced by a project containing one or more package.json files.
 *
 * @param projectDirectory directory of the project to scan
 * @returns unique list of Goldstack package versions referenced by the project
 */
export function collectGoldstackPackageVersions(
  projectDirectory: string,
): GoldstackPackageVersion[] {
  const packages = new Map<string, GoldstackPackageVersion>();

  for (const packageJsonPath of findPackageJsonFiles(projectDirectory)) {
    for (const dependency of readPackageJsonDependencies(packageJsonPath)) {
      const key = packageKey(dependency);
      if (!packages.has(key)) {
        packages.set(key, dependency);
      }
    }
  }

  return [...packages.values()];
}

async function fetchPackageManifestFromRegistry(
  packageVersion: GoldstackPackageVersion,
): Promise<PackageManifest | null> {
  const url = `${REGISTRY_URL}/${encodeURIComponent(packageVersion.name)}`;

  try {
    const response = await fetch(url, {
      headers: {
        accept: REGISTRY_ACCEPT_HEADER,
      },
    });
    if (!response.ok) {
      return null;
    }
    const packument = (await response.json()) as {
      versions?: Record<string, PackageManifest>;
    };
    return packument.versions?.[packageVersion.version] ?? null;
  } catch (e) {
    debug(`Could not check npm registry for ${packageVersion.name}@${packageVersion.version}`, {
      error: e instanceof Error ? e.message : `${e}`,
    });
    return null;
  }
}

function renderPackageVersion(packageVersion: GoldstackPackageVersion): string {
  return packageKey(packageVersion);
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait until all Goldstack dependencies of a project are available in the npm registry.
 *
 * The check starts with the dependencies declared in the project's package.json files and then
 * follows the dependencies of every published Goldstack package. This is required since generated
 * projects often reference template packages that in turn depend on other Goldstack packages, and
 * those transitive packages may become visible in the registry later than their consumers.
 *
 * @param params parameters for the wait operation
 */
export async function waitForPublishedPackages(
  params: WaitForPublishedPackagesParams,
): Promise<void> {
  const retryIntervalMs = params.retryIntervalMs ?? DEFAULT_RETRY_INTERVAL_MS;
  const maxWaitTimeMs = params.maxWaitTimeMs ?? DEFAULT_MAX_WAIT_TIME_MS;
  const fetchPackageManifest = params.fetchPackageManifest ?? fetchPackageManifestFromRegistry;

  const knownPackages = new Map<string, GoldstackPackageVersion>();
  for (const packageVersion of collectGoldstackPackageVersions(params.projectDirectory)) {
    knownPackages.set(packageKey(packageVersion), packageVersion);
  }

  if (knownPackages.size === 0) {
    debug(`No Goldstack packages found to wait for in ${params.projectDirectory}`);
    return;
  }

  const startTime = Date.now();
  const publishedPackages = new Set<string>();
  const discoveredPackages = new Set<string>();

  while (true) {
    const packagesToCheck = [...knownPackages.entries()].filter(
      ([key]) => !publishedPackages.has(key),
    );

    if (packagesToCheck.length > 0) {
      const results = await Promise.all(
        packagesToCheck.map(async ([key, packageVersion]) => ({
          key,
          packageVersion,
          manifest: await fetchPackageManifest(packageVersion),
        })),
      );

      const unpublishedPackages: GoldstackPackageVersion[] = [];
      for (const result of results) {
        if (!result.manifest) {
          unpublishedPackages.push(result.packageVersion);
          continue;
        }

        publishedPackages.add(result.key);

        if (discoveredPackages.has(result.key)) {
          continue;
        }
        discoveredPackages.add(result.key);

        for (const dependency of collectGoldstackDependenciesFromManifest(result.manifest)) {
          const key = packageKey(dependency);
          if (!knownPackages.has(key)) {
            knownPackages.set(key, dependency);
          }
        }
      }

      if (unpublishedPackages.length > 0) {
        const elapsedTimeMs = Date.now() - startTime;
        if (elapsedTimeMs + retryIntervalMs > maxWaitTimeMs) {
          throw new Error(
            `Goldstack packages not available in the npm registry after ${Math.round(
              elapsedTimeMs / 1000,
            )}s: ${unpublishedPackages.map(renderPackageVersion).join(', ')}`,
          );
        }

        warn(
          `Waiting for Goldstack packages to be published: ${unpublishedPackages
            .map(renderPackageVersion)
            .join(', ')}. Retrying in ${Math.round(retryIntervalMs / 1000)}s.`,
        );
        await wait(retryIntervalMs);
      }

      continue;
    }

    info(`All ${knownPackages.size} Goldstack package versions are available in the npm registry.`);
    return;
  }
}
