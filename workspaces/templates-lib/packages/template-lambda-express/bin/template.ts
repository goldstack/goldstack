import { run } from './../dist/src/templateLambdaExpress';


run(process.argv).catch((e) => {
  console.log(e);
  process.exit(1);
});
