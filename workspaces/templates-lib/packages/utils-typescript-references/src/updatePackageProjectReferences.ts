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
) {
  const packageJson = fs
    .readFileSync(path.resolve(packageDir, './package.json'))
    .toString();
  const packageJsonData = JSON.parse(packageJson);
  const tsConfig = fs
    .readFileSync(path.resolve(packageDir, './tsconfig.json'))
    .toString();

  const tsConfigData = JSON.parse(tsConfig);

  tsConfigData.references = [
    ...Object.keys(packageJsonData.dependencies || {}),
    ...Object.keys(packageJsonData.devDependencies || {}),
  ]
    // all dependencies that are workspace dependencies
    .filter(
      (dependencyData) =>
        allPackages.filter((packageData) => packageData.name === dependencyData)
          .length > 0
    )
    // for each add a path
    .map((dependencyData) => {
      const dependencyPackageData = allPackages.find(
        (packageData) => packageData.name === dependencyData
      );
      if (!dependencyPackageData) {
        throw new Error('Package not found');
      }
      return {
        path: path.posix.relative(packageData.path, dependencyPackageData.path),
      };
    });

  const tsConfigPath = path.resolve(packageDir, './tsconfig.json');
  const newData = JSON.stringify(tsConfigData, null, 2);
  // only update the config file when it has changed
  if (
    !fs.existsSync(tsConfigPath) ||
    fs.readFileSync(tsConfigPath).toString() !== newData
  ) {
    console.log(
      `Updating project references in ${tsConfigPath} to:\n` +
        tsConfigData.references.map((refData) => refData.path).join('\n ')
    );
    fs.writeFileSync(tsConfigPath, newData);
  }
}
