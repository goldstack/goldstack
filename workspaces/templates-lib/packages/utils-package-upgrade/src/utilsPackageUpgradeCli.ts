import { ensureLocalDependencies } from './utilsPackageUpgrade';

export const run = async (args: string[]): Promise<void> => {
  await ensureLocalDependencies({ rootDir: args[2] });
};
