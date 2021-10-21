import { toProjectReferences } from '@monorepo-utils/workspaces-to-typescript-project-references';
import path from 'path';
import { updatePackageProjectReferences } from './updatePackageProjectReferences';
import { updateRootProjectReferences } from './updateRootProjectReferences';

export const run = (args: string[]): void => {
  console.log('run ' + args);
  if (args.indexOf('--skipPackages') === -1) {
    // const res = toProjectReferences({
    //   rootDir: path.resolve('./'),
    //   checkOnly: false,
    // });

    // if (!res.ok) {
    //   if (res.aggregateError) {
    //     console.error(res.aggregateError.message);
    //   }
    //   process.exit(1);
    // }
    console.log('packages');
    updatePackageProjectReferences();
  }

  if (args.indexOf('--skipRoot') === -1) {
    updateRootProjectReferences();
  }
};
