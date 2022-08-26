import { run } from '@goldstack/template-ssr-cli';

import { esbuildConfig } from './esbuild';

run(process.argv, esbuildConfig()).catch((e) => {
  console.log(e);
  process.exit(1);
});
