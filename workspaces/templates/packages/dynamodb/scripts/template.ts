import { run } from '@goldstack/template-dynamodb';

run(process.argv).catch((e) => {
  console.log(e);
  process.exit(1);
});
