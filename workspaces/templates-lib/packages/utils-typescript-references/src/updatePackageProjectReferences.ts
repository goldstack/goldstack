import fs from 'fs';
import { execSync } from 'child_process';
import { getPackages, PackageData } from './sharedUtils';
import path from 'path';

export const updatePackageProjectReferences = (): void => {
  const cmdRes = execSync('yarn workspaces list --json').toString();

  const allPackages = getPackages(cmdRes);

  for (const packageData of allPackages) {
    const packageDir = packageData.path;

    if (fs.existsSync(path.resolve(packageDir, './tsconfig.json'))) {
      processPackage(packageDir, allPackages, packageData);
    } else {
      console.log(`Skipping package ${packageDir}`);
    }
  }
};

function processPackage(
  packageDir: string,
  allPackages: PackageData[],
  packageData: PackageData
): void {
  const packageJson = fs
    .readFileSync(path.resolve(packageDir, './package.json'))
    .toString();
  const packageJsonData = JSON.parse(packageJson);
  const tsConfigPath = path.join(packageDir, 'tsconfig.json');
  const tsConfig = fs.readFileSync(tsConfigPath).toString();

  const tsConfigData = JSON.parse(tsConfig);
  const oldReferences = tsConfigData.references || [];

  const newReferences = [
    ...Object.keys(packageJsonData.dependencies || {}),
    ...Object.keys(packageJsonData.devDependencies || {}),
  ]
    // all dependencies that are workspace dependencies and have a tsconfig.json
    .map((dependencyData) =>
      allPackages.find((packageData) => packageData.name === dependencyData)
    )
    .filter((dependencyPackageData): dependencyPackageData is PackageData => {
      return (
        !!dependencyPackageData &&
        fs.existsSync(path.resolve(dependencyPackageData.path, 'package.json'))
      );
    })
    // for each add a path
    .map((dependencyPackageData) => {
      return {
        path: path.posix.relative(packageData.path, dependencyPackageData.path),
      };
    });

  // Exit early if references are unchanged (using JSON for deep comparison)
  if (JSON.stringify(oldReferences) === JSON.stringify(newReferences)) {
    return;
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
    console.log(
      `Updating project references in ${tsConfigPath} to:` +
        newReferences.map((refData) => `\n  ${refData.path}`).join('')
    );
  } else {
    console.log(`Removing project references in ${tsConfigPath}`);
  }
  fs.writeFileSync(tsConfigPath, newData);
}
