import fs from 'fs';
import path from 'path';

export interface PackageData {
  path: string;
  name: string;
}

export function getPackages(cmdRes: string): PackageData[] {
  return cmdRes
    .split('\n')
    .map((line) => {
      if (line.trim() === '') {
        return {
          path: undefined,
          name: undefined,
        };
      }
      const packageData = JSON.parse(line);
      if (packageData.location === '.') {
        return {
          path: undefined,
          name: undefined,
        };
      }
      // ignore packages without TypeScript configuration
      if (!fs.existsSync(`${packageData.location}/tsconfig.json`)) {
        return {
          path: undefined,
          name: undefined,
        };
      }
      return {
        path: packageData.location,
        name: packageData.name,
      };
    })
    .filter((packageData) => packageData.path && packageData.name);
}

/**
 * Search a folder for the preferred tsconfig.json file based
 * on the options in tsConfigNames.
 *
 * @param workspacePath Directory to search in
 * @param tsConfigNames List of tsconfig.json files to search for in order
 *    of preference
 */
export function getTsConfigPath(
  workspacePath: string,
  tsConfigNames: string[],
): string | undefined {
  return tsConfigNames
    .map((tsConfigName) => path.posix.join(workspacePath, tsConfigName))
    .find((tsConfigPath) => fs.existsSync(tsConfigPath));
}

/**
 * Calculate the references array for the package
 *
 * @param packagePath Path to the package we are updating references for
 * @param packages Packages the package wants to reference
 * @param tsConfigNames Configured tsconfig file names
 */
export function makeReferences(
  packagePath: string,
  packages: Array<PackageData | null | undefined>,
  tsConfigNames: string[],
): Array<{ path: string }> {
  return (
    packages
      .filter((p): p is PackageData => !!p)
      .map((dependencyData) => getTsConfigPath(dependencyData.path, tsConfigNames))
      .filter((p): p is string => !!p)
      // for each add a path
      .map((tsConfigPath) => ({
        path: path.posix.relative(
          packagePath,
          path.basename(tsConfigPath) === 'tsconfig.json'
            ? path.dirname(tsConfigPath)
            : tsConfigPath,
        ),
      }))
  );
}
