import { updatePackageProjectReferences } from './updatePackageProjectReferences';
import { updateRootProjectReferences } from './updateRootProjectReferences';

export const run = (args: string[]): void => {
  if (args.indexOf('--skipPackages') === -1) {
    updatePackageProjectReferences();
  }

  if (args.indexOf('--skipRoot') === -1) {
    updateRootProjectReferences();
  }
};
