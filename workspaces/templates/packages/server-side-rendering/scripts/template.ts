import { run } from '@goldstack/template-ssr-cli';

run(process.argv).catch((e) => {
  console.log(e);
  process.exit(1);
});
