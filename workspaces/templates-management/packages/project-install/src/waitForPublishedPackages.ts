import { debug, info, warn } from '@goldstack/utils-log';
import { read } from '@goldstack/utils-sh';
import { readdirSync, statSync } from 'fs';
import path from 'path';

const DEFAULT_RETRY_INTERVAL_MS = 60 * 1000;
const DEFAULT_MAX_WAIT_TIME_MS = 30 * 60 * 1000;
const REGISTRY_URL = 'https://registry.npmjs.org';
const GOLDSTACK_PACKAGE_PREFIX = '@goldstack/';

const ignoredDirectories = new Set(['.git', '.yarn', '.cache', 'node_modules']);

const exactVersionRegex = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-.]+)?$/;

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

function readPackageJsonDependencies(packageJsonPath: string): GoldstackPackageVersion[] {
  const packageJson = JSON.parse(read(packageJsonPath));
  const dependencyTypes = [
    'dependencies',
    'devDependencies',
    'optionalDependencies',
    'peerDependencies',
  ];
  const dependencies: GoldstackPackageVersion[] = [];

  for (const dependencyType of dependencyTypes) {
    const dependencySet = packageJson[dependencyType] as Record<string, string> | undefined;
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
      const key = `${dependency.name}@${dependency.version}`;
      if (!packages.has(key)) {
        packages.set(key, dependency);
      }
    }
  }

  return [...packages.values()];
}

async function isPackageVersionPublished(
  packageVersion: GoldstackPackageVersion,
): Promise<boolean> {
  const url = `${REGISTRY_URL}/${encodeURIComponent(
    packageVersion.name,
  )}/${encodeURIComponent(packageVersion.version)}`;

  try {
    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
      },
    });
    return response.ok;
  } catch (e) {
    debug(`Could not check npm registry for ${packageVersion.name}@${packageVersion.version}`, {
      error: e instanceof Error ? e.message : `${e}`,
    });
    return false;
  }
}

function renderPackageVersion(packageVersion: GoldstackPackageVersion): string {
  return `${packageVersion.name}@${packageVersion.version}`;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait until all Goldstack dependencies of a project are available in the npm registry.
 *
 * This prevents template builds from failing with 404 errors when packages have not been fully
 * propagated by the npm registry yet after a release.
 *
 * @param params parameters for the wait operation
 */
export async function waitForPublishedPackages(
  params: WaitForPublishedPackagesParams,
): Promise<void> {
  const retryIntervalMs = params.retryIntervalMs ?? DEFAULT_RETRY_INTERVAL_MS;
  const maxWaitTimeMs = params.maxWaitTimeMs ?? DEFAULT_MAX_WAIT_TIME_MS;
  const packages = collectGoldstackPackageVersions(params.projectDirectory);

  if (packages.length === 0) {
    debug(`No Goldstack packages found to wait for in ${params.projectDirectory}`);
    return;
  }

  const startTime = Date.now();
  let pendingPackages = packages;

  while (true) {
    const results = await Promise.all(
      pendingPackages.map(async (packageVersion) => ({
        packageVersion,
        published: await isPackageVersionPublished(packageVersion),
      })),
    );
    const unpublishedPackages = results
      .filter((result) => !result.published)
      .map((result) => result.packageVersion);

    if (unpublishedPackages.length === 0) {
      info(`All ${packages.length} Goldstack package versions are available in the npm registry.`);
      return;
    }

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
    pendingPackages = unpublishedPackages;
  }
}
