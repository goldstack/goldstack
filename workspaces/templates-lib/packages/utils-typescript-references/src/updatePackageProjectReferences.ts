import fs from 'fs';
import { execSync } from 'child_process';
import { getPackages } from './sharedUtils';
import path from 'path';

export const updatePackageProjectReferences = (): void => {
  const cmdRes = execSync('yarn workspaces list --json').toString();

  const allPackages = getPackages(cmdRes);

  const root = process.cwd();

  console.log(root);
  for (const packageData of allPackages) {
    console.log(`Processing package ${packageData.path}`);
    execSync(`cd ${packageData.path}`);

    const packageJson = fs.readFileSync('./package.json').toString();
    const packageJsonData = JSON.parse(packageJson);
    const tsConfig = fs.readFileSync('./tsconfig.json').toString();

    const tsConfigData = JSON.parse(tsConfig);

    tsConfigData.references = [
      ...(Object.keys(packageJsonData.dependencies) || []),
      ...(Object.keys(packageJsonData.devDependencies) || []),
    ]
      // all dependencies that are workspace dependencies
      .filter(
        (dependencyData) =>
          allPackages.filter(
            (packageData) => packageData.name === dependencyData
          ).length > 0
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
          path: path.posix.relative(
            packageData.path,
            dependencyPackageData.path
          ),
        };
      });

    console.log(tsConfigData.references);
    // fs.writeFileSync('./tsconfig.json', JSON.stringify(tsConfigData, null, 2));
    execSync(`cd ${root}`);
  }
};
