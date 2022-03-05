import {
  readLambdaConfig,
  generateFunctionName,
} from '@goldstack/utils-aws-lambda';
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
  const routesConfig = readLambdaConfig('./testData/routes-test');
  const config = generateLambdaConfig(dummyDeployment, routesConfig);
  test('Should render config for Terraform', () => {
    assert(config['default'].function_name);
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
  test('Should determine path parametmers for file names', () => {
    const nestedRoute = routesConfig.find(
      (e) => e.path === '/folder/{pathparam}'
    );
    assert(nestedRoute);
    const functionName = generateFunctionName(
      dummyDeployment.configuration.lambdaNamePrefix,
      nestedRoute
    );
    assert(functionName.indexOf('folder') !== -1);
    assert(functionName.indexOf('{') === -1);
    assert(functionName.indexOf('}') === -1);
  });
  test('Should determine path parametmers for folder names', () => {
    const nestedRoute = routesConfig.find(
      (e) => e.path === '/resource/{path}/object'
    );
    assert(nestedRoute);
    const functionName = generateFunctionName(
      dummyDeployment.configuration.lambdaNamePrefix,
      nestedRoute
    );
    assert(functionName.indexOf('object') !== -1);
    assert(functionName.indexOf('resource') !== -1);
    assert(functionName.indexOf('{') === -1);
    assert(functionName.indexOf('}') === -1);
  });
  test('Should provide a correct path for a nested index file', () => {
    const nestedRoute = routesConfig.find((e) => e.path === '/health');
    assert(nestedRoute);

    const functionName = generateFunctionName(
      dummyDeployment.configuration.lambdaNamePrefix,
      nestedRoute
    );
    expect(functionName).toContain('health');
  });
  test('Should provide a correct path for a file in the API root', () => {
    const nestedRoute = routesConfig.find((e) => e.path === '/resource');
    assert(nestedRoute);

    const functionName = generateFunctionName(
      dummyDeployment.configuration.lambdaNamePrefix,
      nestedRoute
    );
    assert(functionName.match(/resource/g)?.length === 1);
  });
  test('Should hash long names', () => {
    const nestedRoute = routesConfig.find((e) => e.path === '/resource');
    assert(nestedRoute);

    const functionName = generateFunctionName(
      'very_long_names_should_end_with_a_hash_and_never_be_longer_than_64_characters',
      nestedRoute
    );
    expect(functionName.length <= 64).toBeTruthy();
    expect(functionName.indexOf('characters') === -1).toBe(true);
  });
});
