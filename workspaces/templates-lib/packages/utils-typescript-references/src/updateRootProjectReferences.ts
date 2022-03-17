import fs from 'fs';
import { execSync } from 'child_process';
import { getPackages, getTsConfigPath, makeReferences } from './sharedUtils';
import path from 'path';

export const updateRootProjectReferences = (tsConfigNames: string[]): void => {
  const cmdRes = execSync('yarn workspaces list --json').toString();

  const allPackages = getPackages(cmdRes);
  const tsConfigPath = getTsConfigPath('.', tsConfigNames);
  if (!tsConfigPath) {
    console.warn('No root-level tsconfig.json found');
    return;
  }

  try {
    const tsConfig = fs.readFileSync(tsConfigPath).toString();

    const tsConfigData = JSON.parse(tsConfig);
    const oldReferences = tsConfigData.references;
    const newReferences = makeReferences('.', allPackages, tsConfigNames);

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
        `Updating project references in ${tsConfigPath} to:` +
          newReferences.map((refData) => `\n  ${refData.path}`).join('')
      );
    } else {
      console.log(`Removing project references in ${tsConfigPath}`);
    }
    fs.writeFileSync(tsConfigPath, newContent);
  } catch (e) {
    console.error(e, `While processing top level config file ${tsConfigPath}`);
  }
};
