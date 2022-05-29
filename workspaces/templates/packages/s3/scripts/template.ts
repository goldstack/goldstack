import { run } from '@goldstack/template-s3-cli';

run(process.argv).catch((e) => {
  console.log(e);
  process.exit(1);
});
