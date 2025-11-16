import { RouteType } from '@goldstack/utils-aws-lambda';
import path from 'path';
import { buildLambdas } from './../src/templateLambdaApiBuild';

const fileToBuild = path.resolve('./testData/build-test/index.ts');

(async () => {
  await buildLambdas({
    routesDir: './testData/build-test',
    configs: [
      {
        path: '/index',
        relativeFilePath: 'index.ts',
        name: 'test-lambda-index',
        absoluteFilePath: fileToBuild,
        route: 'ANY /',
        type: RouteType.FUNCTION,
      },
    ],
  });
})().then(() => {
  console.log('done');
});
