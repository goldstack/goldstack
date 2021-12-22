import { run } from './../dist/src/templateLambdaApi';

run(process.argv).catch((e) => {
  console.log(e);
  process.exit(1);
});
