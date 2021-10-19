import { run } from '@goldstack/template-lambda-express';

run(process.argv).catch((e) => {
  console.log(e);
  process.exit(1);
});
