import fs from 'fs';
import { execSync } from 'child_process';
import { getPackages } from './sharedUtils';
import path from 'path';

export const updateRootProjectReferences = (): void => {
  const cmdRes = execSync('yarn workspaces list --json').toString();

  const allPackages = getPackages(cmdRes);

  const tsConfig = fs.readFileSync('./tsconfig.json').toString();

  const tsConfigData = JSON.parse(tsConfig);
  const oldReferences = tsConfigData.references;
  const newReferences = allPackages
    .map(({ path }) => ({ path }))
    .filter((ref) => fs.existsSync(path.join(ref.path, 'tsconfig.json')));

  // Don't continue if references are unchanged
  if (JSON.stringify(newReferences) === JSON.stringify(oldReferences)) {
    return;
  }

  const newContent = JSON.stringify(
    {
      ...tsConfigData,
      // Override references; or omit them if empty
      references: newReferences.length ? newReferences : undefined,
    },
    null,
    2
  );

  if (newReferences.length) {
    console.log(
      'Updating project references in ./tsconfig.json to:' +
        newReferences.map((refData) => `\n  ${refData.path}`).join('')
    );
  } else {
    console.log('Removing project references in ./tsconfig.json');
  }
  fs.writeFileSync('./tsconfig.json', newContent);
};
