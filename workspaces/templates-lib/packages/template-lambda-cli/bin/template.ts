import { run } from './../dist/src/templateLambdaCli';

run(process.argv).catch((e) => {
  console.log(e);
  process.exit(1);
});
