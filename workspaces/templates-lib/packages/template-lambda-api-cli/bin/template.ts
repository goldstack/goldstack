import { run } from './../dist/src/templateLambdaApiCli';

run(process.argv).catch((e) => {
  console.log(e);
  process.exit(1);
});
