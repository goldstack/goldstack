import fs from 'fs';
import { execSync } from 'child_process';
import {
  getPackages,
  getTsConfigPath,
  type PackageData,
  makeReferences,
} from './sharedUtils';
import path from 'path';
import { error, info } from '@goldstack/utils-log';

type ProcessPackageResult = 'success' | 'failure';

export const updatePackageProjectReferences = ({
  tsConfigNames,
  excludeInReferences,
}: {
  tsConfigNames: string[];
  excludeInReferences: string[];
}): void => {
  const cmdRes = execSync('yarn workspaces list --json').toString();

  const allPackages = getPackages(cmdRes);

  let isSuccess = true;
  for (const packageData of allPackages) {
    const packageDir = packageData.path;

    if (fs.existsSync(path.resolve(packageDir, './tsconfig.json'))) {
      isSuccess =
        processPackage({
          packageDir,
          allPackages,
          tsConfigNames,
          excludeInReferences,
        }) === 'success' && isSuccess;
    } else {
      info(`Skipping package ${packageDir}`);
    }
  }
  if (!isSuccess) {
    throw new Error('One or more packages failed to update');
  }
};

function processPackage({
  packageDir,
  allPackages,
  tsConfigNames,
  excludeInReferences,
}: {
  packageDir: string;
  allPackages: PackageData[];
  tsConfigNames: string[];
  excludeInReferences: string[];
}): ProcessPackageResult {
  const packageJson = fs
    .readFileSync(path.resolve(packageDir, './package.json'))
    .toString();
  const packageJsonData = JSON.parse(packageJson);
  const tsConfigPath = getTsConfigPath(packageDir, tsConfigNames);
  if (!tsConfigPath) {
    return 'success';
  }
  try {
    const tsConfig = fs.readFileSync(tsConfigPath).toString();
    const tsConfigData = JSON.parse(tsConfig);
    const oldReferences = tsConfigData.references || [];

    const newReferences = makeReferences(
      packageDir,
      [
        ...Object.keys(packageJsonData.dependencies || {}),
        ...Object.keys(packageJsonData.devDependencies || {}),
      ]
        // all dependencies that are workspace dependencies and have a tsconfig.json
        .map((dependencyData) =>
          allPackages.find((packageData) => packageData.name === dependencyData)
        )
        // remove packages that should be excluded in references
        .filter(
          (packageData) =>
            packageData && excludeInReferences.indexOf(packageData.name) === -1
        ),
      tsConfigNames
    );

    // Exit early if references are unchanged (using JSON for deep comparison)
    if (JSON.stringify(oldReferences) === JSON.stringify(newReferences)) {
      return 'success';
    }

    const newData = JSON.stringify(
      {
        ...tsConfigData,
        // Override references; or omit them if empty
        references: newReferences.length ? newReferences : undefined,
      },
      null,
      2
    );

    // only update the config file when it has changed
    if (newReferences.length) {
      info(
        `Updating project references in ${tsConfigPath} to:` +
          newReferences.map((refData) => `\n  ${refData.path}`).join('')
      );
    } else {
      info(`Removing project references in ${tsConfigPath}`);
    }
    fs.writeFileSync(tsConfigPath, newData);
    return 'success';
  } catch (e) {
    error(`Error while processing ${tsConfigPath}\n${e}`);
    return 'failure';
  }
}
