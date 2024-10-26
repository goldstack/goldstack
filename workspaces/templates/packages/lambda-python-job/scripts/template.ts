import { run } from '@goldstack/template-lambda-trigger-cli';

run(process.argv).catch((e) => {
  console.log(e);
  process.exit(1);
});
