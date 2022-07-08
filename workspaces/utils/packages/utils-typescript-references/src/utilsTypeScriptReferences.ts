import { updatePackageProjectReferences } from './updatePackageProjectReferences';
import { updateRootProjectReferences } from './updateRootProjectReferences';

import yargs, { Argv } from 'yargs';

interface RunOptions {
  tsConfigNames: string[];
  excludeInReferences: string[];
  excludeInRoot: string[];
  skipPackages: boolean;
  skipRoot: boolean;
}

export const run = async (args: string[]): Promise<void> => {
  const argv = await yargs
    .scriptName('utils-typescript-references')
    .version('0.2.0')
    .option('skipPackages', {
      description: 'Only update project references in the root tsConfig',
      type: 'boolean',
    })
    .option('skipRoot', {
      description: 'Skip updating project references in project root tsConfig',
      type: 'boolean',
    })
    .option('excludeInReferences', {
      type: 'array',
      description:
        'Exclude specific packages from being referenced by other packages',
    })
    .option('excludeInRoot', {
      type: 'array',
      description:
        'Exclude specific packages from being referenced in the root tsConfig',
    })
    .option('tsConfigName', {
      type: 'array',
      description: 'Names of tsConfig files to be updated',
    })
    .parse();

  const options: RunOptions = {
    tsConfigNames: [],
    excludeInReferences: [],
    excludeInRoot: [],
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

  if (argv.excludeInReferences) {
    options.excludeInReferences = argv.excludeInReferences as string[];
  }
  if (argv.excludeInRoot) {
    options.excludeInRoot = argv.excludeInRoot as string[];
  }
  if (!options.skipPackages) {
    updatePackageProjectReferences({
      tsConfigNames: options.tsConfigNames,
      excludeInReferences: options.excludeInReferences,
    });
  }

  if (!options.skipRoot) {
    updateRootProjectReferences({
      tsConfigNames: options.tsConfigNames,
      excludeProjects: options.excludeInRoot,
    });
  }
};
