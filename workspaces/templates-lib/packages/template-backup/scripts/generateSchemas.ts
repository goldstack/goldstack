import { run } from '@goldstack/utils-package-config-generate';

declare var process: { argv: string[] };

run(process.argv);
