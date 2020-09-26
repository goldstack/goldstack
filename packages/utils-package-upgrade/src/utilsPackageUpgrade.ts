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
  console.log(globStr);
  const packages = await glob([globStr]);

  for (const packageFile of packages) {
    console.log(packageFile);
    const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf-8'));
    const packageName = packageJson.name;
    const packageVersion = packageJson.version;
    const command = `up ${packageName}@${packageVersion}`;
    console.log(command);

    yarn(rootDir, command);
  }
};
