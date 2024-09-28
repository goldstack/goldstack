import { run } from '@goldstack/template-lambda-http-cli';

run(process.argv).catch((e) => {
  console.log(e);
  process.exit(1);
});
