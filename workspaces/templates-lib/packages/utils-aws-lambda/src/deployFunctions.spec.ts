import { RouteType } from '@goldstack/utils-aws-lambda';
import { pwd, read } from '@goldstack/utils-sh';
import fs from 'fs';
import path from 'path';
import { buildFunctions } from './buildFunctions';
import { defaultBuildOptions } from './defaultBuildOptions';

jest.setTimeout(30000);

describe('Testing lambda build', () => {
  it('Should build lambda', async () => {
    const fileToBuild = path.resolve('./testData/build-test/index.ts');
    expect(fs.existsSync(fileToBuild)).toEqual(true);
    await buildFunctions({
      buildOptions: defaultBuildOptions(),
      deploymentName: 'local',
      lambdaNamePrefix: 'local-test',
      packageRootDir: pwd(),
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
    const generated = read('./distLambda/index/lambda.js');
    expect(generated.length).toBeGreaterThan(100);
  });

  it('Should build lambda with custom esbuild config', async () => {
    await buildFunctions({
      routesDir: './testData/build-test',
      buildOptions: defaultBuildOptions(),
      lambdaNamePrefix: 'local-test',
      packageRootDir: pwd(),
      deploymentName: 'local',
      configs: [
        {
          path: '/customBuild',
          relativeFilePath: 'customBuild.ts',
          name: 'test-lambda-customBuild',
          absoluteFilePath: path.resolve('./testData/build-test/customBuild.ts'),
          route: 'ANY /',
          type: RouteType.FUNCTION,
        },
      ],
    });
    const generated = read('./distLambda/customBuild/lambda.js');
    expect(generated).toContain('Custom config in operation');
  });
});
