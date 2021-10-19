import { run } from '@goldstack/template-static-website-aws';

run(process.argv).catch((e) => {
  console.log(e);
  process.exit(1);
});
