import { run } from '@goldstack/template-lambda-cli';

run(process.argv).catch((e) => {
  console.log(e);
  process.exit(1);
});
