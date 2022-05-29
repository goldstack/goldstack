import { run } from '@goldstack/template-lambda-api-cli';

run(process.argv).catch((e) => {
  console.log(e);
  process.exit(1);
});
