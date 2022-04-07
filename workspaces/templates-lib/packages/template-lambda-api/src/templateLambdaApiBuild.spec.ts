import { RouteType } from '@goldstack/utils-aws-lambda';
import { read } from '@goldstack/utils-sh';
import path from 'path';
import { buildLambdas } from './templateLambdaApiBuild';

jest.setTimeout(30000);

describe('Testing lambda build', () => {
  it('Should build lambda', async () => {
    await buildLambdas('./testData/build-test', [
      {
        path: '/index',
        relativeFilePath: 'index.ts',
        name: 'test-lambda-index',
        absoluteFilePath: path.resolve('./testData/build-test/index.ts'),
        route: 'ANY /',
        type: RouteType.FUNCTION,
      },
    ]);
    const generated = read('./distLambda/index/lambda.js');
    expect(generated.length).toBeGreaterThan(100);
  });

  it('Should build lambda with custom esbuild config', async () => {
    await buildLambdas('./testData/build-test', [
      {
        path: '/customBuild',
        relativeFilePath: 'customBuild.ts',
        name: 'test-lambda-customBuild',
        absoluteFilePath: path.resolve('./testData/build-test/customBuild.ts'),
        route: 'ANY /',
        type: RouteType.FUNCTION,
      },
    ]);
    const generated = read('./distLambda/customBuild/lambda.js');
    expect(generated).toContain('Custom config in operation');
  });
});
