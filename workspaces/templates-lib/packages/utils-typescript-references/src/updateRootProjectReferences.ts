import fs from 'fs';
import { execSync } from 'child_process';
import { getPackages } from './sharedUtils';

export const updateRootProjectReferences = (): void => {
  const cmdRes = execSync('yarn workspaces list --json').toString();

  const allPackages = getPackages(cmdRes);

  const tsConfig = fs.readFileSync('./tsconfig.json').toString();

  const tsConfigData = JSON.parse(tsConfig);

  tsConfigData.references = allPackages.filter(
    (packageData) => packageData.path
  );

  fs.writeFileSync('./tsconfig.json', JSON.stringify(tsConfigData, null, 2));
};
