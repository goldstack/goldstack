import { updatePackageProjectReferences } from './updatePackageProjectReferences';
import { updateRootProjectReferences } from './updateRootProjectReferences';

import yargs, { Argv } from 'yargs';

interface RunOptions {
  tsConfigNames: string[];
  excludeInReferences: string[];
  skipPackages: boolean;
  skipRoot: boolean;
}

export const run = async (args: string[]): Promise<void> => {
  const argv = await yargs
    .scriptName('utils-typescript-references')
    .option('skipPackages', {
      description: 'Only update project references in the root tsConfig',
      type: 'boolean',
    })
    .option('skipRoot', {
      description: 'Skip updating project references in project root tsConfig',
      type: 'boolean',
    })
    .option('exclude', {
      type: 'array',
      description:
        'Exclude specific packages from being referenced by other packages',
    })
    .option('tsConfigName', {
      type: 'array',
      description: 'Names of tsConfig files to be updated',
    })
    .parse();

  const options: RunOptions = {
    tsConfigNames: [],
    excludeInReferences: [],
    skipPackages: false,
    skipRoot: false,
  };

  if (argv.skipPackages) {
    options.skipPackages = true;
  }
  if (argv.skipRoot) {
    options.skipRoot = true;
  }

  if (argv.tsConfigName && argv.tsConfigName?.length > 0) {
    options.tsConfigNames = argv.tsConfigName as string[];
  } else {
    options.tsConfigNames.push('tsconfig.json');
  }

  if (argv.exclude) {
    options.excludeInReferences = argv.exclude as string[];
  }
  if (!options.skipPackages) {
    updatePackageProjectReferences({
      tsConfigNames: options.tsConfigNames,
      excludeInReferences: options.excludeInReferences,
    });
  }

  if (!options.skipRoot) {
    updateRootProjectReferences(options.tsConfigNames);
  }
};
