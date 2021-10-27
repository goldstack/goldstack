import { ensureLocalDependencies } from '@goldstack/utils-package-upgrade';

const run = async (args: string[]): Promise<void> => {
  await ensureLocalDependencies({ rootDir: args[2] });
};

run(process.argv).catch((e) => {
  console.error('Error running command');
  console.error(e as any);
  process.exit(1);
});
