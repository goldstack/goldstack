import glob from 'fast-glob';

import path from 'path';
import fs from 'fs';

import { yarn } from '@goldstack/utils-yarn';

export const ensureLocalDependencies = async ({
  rootDir,
}: {
  rootDir: string;
}): Promise<void> => {
  const globStr = (rootDir || '') + 'workspaces/*/packages/*/package.json';
  const packages = await glob([globStr]);

  for (const packageFile of packages) {
    const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf-8'));
    const packageName = packageJson.name;
    const packageVersion = packageJson.version;
    const command = `up ${packageName}@${packageVersion}`;
    try {
      yarn(rootDir || '.', command);
    } catch (e) {
      console.log('failed for ' + packageFile);
    }
  }
};
