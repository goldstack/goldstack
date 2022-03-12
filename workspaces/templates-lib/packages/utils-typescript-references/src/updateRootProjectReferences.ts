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

  const newContent = JSON.stringify(tsConfigData, null, 2);

  if (newContent !== fs.readFileSync('./tsconfig.json').toString()) {
    console.log(
      "Updating project references in './tsconfig.json' to:\n" +
        tsConfigData.references.map((refData) => refData.path).join('\n ')
    );
    fs.writeFileSync('./tsconfig.json', newContent);
  }
};
