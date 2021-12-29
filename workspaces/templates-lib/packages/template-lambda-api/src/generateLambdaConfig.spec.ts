import { readLambdaConfig } from '@goldstack/utils-aws-lambda';
import assert from 'assert';
import { generateLambdaConfig } from './generateLambdaConfig';
import { LambdaApiDeployment } from './templateLambdaApi';
import { getOutDirForLambda } from './templateLambdaApiBuild';

const dummyDeployment: LambdaApiDeployment = {
  awsRegion: 'ap-east-1',
  awsUser: 'dummy',
  configuration: {
    lambdaNamePrefix: 'test-lambdas',
    apiDomain: 'domain',
    hostedZoneDomain: 'domain',
    lambdas: {},
  },
  name: 'test',
};

describe('Generate Lambda config', () => {
  const routesConfig = readLambdaConfig('./testData');
  const config = generateLambdaConfig(dummyDeployment, routesConfig);
  test('Should render config for Terraform', () => {
    assert(config['$default'].function_name);
    assert(
      config['ANY /folder/nested'].function_name.indexOf(
        dummyDeployment.configuration.lambdaNamePrefix || 'fail'
      ) !== -1
    );
  });
  test('Should determine correct output dirs for dist', () => {
    const nestedRoute = routesConfig.find((e) => e.path === '/folder/nested');
    assert(nestedRoute);
    const dir = getOutDirForLambda(nestedRoute);
    assert(dir === './distLambda/folder/nested');
  });
});
