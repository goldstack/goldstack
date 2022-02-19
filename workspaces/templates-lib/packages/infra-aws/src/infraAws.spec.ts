import { getAWSUser } from './infraAws';
import { write, mkdir } from '@goldstack/utils-sh';
import assert from 'assert';
import path from 'path';

describe('AWS User config', () => {
  it.skip('Should read AWS config from Goldstack config file', async () => {
    const awsConfig = `{
  "users": [
    {
      "name": "goldstack-dev",
      "type": "apiKey",
      "config": {
        "awsAccessKeyId": "dummy",
        "awsSecretAccessKey": "dummy",
        "awsDefaultRegion": "us-west-2"
      }
    },
    {
      "name": "goldstack-prod",
      "type": "apiKey",
      "config": {
        "awsAccessKeyId": "dummy-prod",
        "awsSecretAccessKey": "dummy-prod",
        "awsDefaultRegion": "us-west-2"
      }
    }
  ]
}`;
    const testDir = './goldstackLocal/tests/getAWSUser';
    mkdir('-p', testDir);
    write(awsConfig, testDir + '/config-embedded.json');
    const credentialsDev = await getAWSUser(
      'goldstack-dev',
      testDir + '/config-embedded.json'
    );
    assert(credentialsDev.accessKeyId === 'dummy');
    const credentialsProd = await getAWSUser(
      'goldstack-prod',
      testDir + '/config-embedded.json'
    );
    assert(credentialsProd.accessKeyId === 'dummy-prod');
  });

  // problems when initialising AWS config more than once, so leaving this as one test for now

  // following difficult to test
  it.skip('Should read from AWS config in user folder if no config provided', async () => {
    const credentials = await getAWSUser('default', './invalid');
    assert(credentials.accessKeyId);
  });
  it('Should read from AWS config in cli provider', async () => {
    const testDir = './goldstackLocal/tests/getAWSUser';

    const awsConfig = `{
  "users": [
    {
      "name": "dev",
      "type": "profile",
      "config": {
        "profile": "goldstack-dev",
        "awsDefaultRegion": "us-west-2",
        "awsConfigFileName": "${path
          .resolve('./testData/awsCredentials')
          .replace(/\\/g, '/')}"
      }
    },
    {
      "name": "prod",
      "type": "profile",
      "config": {
        "profile": "goldstack-dev",
        "awsDefaultRegion": "us-west-2",
        "awsConfigFileName": "${path
          .resolve('./testData/awsCredentials')
          .replace(/\\/g, '/')}"
      }
    },
    {
      "name": "process",
      "type": "profile",
      "config": {
        "profile": "with-process",
        "awsDefaultRegion": "us-west-2",
        "credentialsSource": "process",
        "awsConfigFileName": "${path
          .resolve('./testData/awsCredentials')
          .replace(/\\/g, '/')}"
      }
    }
  ]
}`;

    mkdir('-p', testDir);
    write(awsConfig, testDir + '/config.json');

    const credentialsProcess = await getAWSUser(
      'process',
      testDir + '/config.json'
    );
    expect(credentialsProcess.secretAccessKey).toEqual('processsecret');
    expect(credentialsProcess.accessKeyId).toEqual('processkey');

    const credentialsDev = await getAWSUser('dev', testDir + '/config.json');
    expect(credentialsDev.secretAccessKey).toEqual('devsecret');
    expect(credentialsDev.accessKeyId).toEqual('devkey');
  });
});
