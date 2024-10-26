import { run } from './../dist/src/templateLambdaTriggerCli';

run(process.argv).catch((e) => {
  console.log(e);
  process.exit(1);
});
