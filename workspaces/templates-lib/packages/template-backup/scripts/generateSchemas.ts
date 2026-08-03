import { run } from '@goldstack/utils-package-config-generate';

// @ts-ignore TS6 + ts-node doesn't resolve process global for scripts outside project scope
run(process.argv);
