import { run } from '@goldstack/template-ssr-cli';

import buildConfig from './build';

run(process.argv, buildConfig()).catch((e) => {
  console.log(e);
  process.exit(1);
});
