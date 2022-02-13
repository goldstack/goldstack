import { run } from '@goldstack/template-lambda-api';

run(process.argv).catch((e) => {
  console.log(e);
  process.exit(1);
});
