import { updatePackageProjectReferences } from './updatePackageProjectReferences';
import { updateRootProjectReferences } from './updateRootProjectReferences';

interface RunOptions {
  tsConfigNames: string[];
  skipPackages: boolean;
  skipRoot: boolean;
}

export const run = (args: string[]): void => {
  const options: RunOptions = {
    tsConfigNames: [],
    skipPackages: false,
    skipRoot: false,
  };
  const defaultArgFallback = (arg: string): void => {
    console.warn(`Unexpected command line argument: ${arg}`);
  };
  let argFallback: (arg: string) => void = defaultArgFallback;

  for (const arg of args.slice(2)) {
    if (arg === '--skipPackages') {
      options.skipPackages = true;
    } else if (arg === '--skipRoot') {
      options.skipRoot = true;
    } else if (arg === '--tsConfigName') {
      argFallback = (arg: string): void => {
        options.tsConfigNames.push(arg);
        argFallback = defaultArgFallback;
      };
    } else {
      argFallback(arg);
    }
  }

  if (!options.tsConfigNames.length) {
    options.tsConfigNames.push('tsconfig.json');
  }

  if (!options.skipPackages) {
    updatePackageProjectReferences(options.tsConfigNames);
  }

  if (!options.skipRoot) {
    updateRootProjectReferences(options.tsConfigNames);
  }
};
