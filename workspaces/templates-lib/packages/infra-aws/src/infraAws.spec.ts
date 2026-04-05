import { mkdir, rmSafe, write } from '@goldstack/utils-sh';
import assert from 'assert';
import path from 'path';
import { getAWSUser } from './getAWSUser';
import { getAWSCredentials, resetAWSUser } from './infraAws';

describe('AWS User config', () => {
  afterEach(() => {
    resetAWSUser();
  });
  it('Should read AWS config from Goldstack config file', async () => {
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
    write(awsConfig, `${testDir}/config-embedded.json`);
    const providerDev = await getAWSUser('goldstack-dev', `${testDir}/config-embedded.json`);
    const credentialsDev = await getAWSCredentials(providerDev);
    assert(credentialsDev.accessKeyId === 'dummy');

    resetAWSUser();
    const providerProd = await getAWSUser('goldstack-prod', `${testDir}/config-embedded.json`);
    const credentialsProd = await getAWSCredentials(providerProd);
    assert.equal(credentialsProd.accessKeyId, 'dummy-prod');
  });

  it('Should read from AWS credentials file', async () => {
    const testDir = './goldstackLocal/tests/getAWSUser';

    const awsConfig = `{
  "users": [
    {
      "name": "dev",
      "type": "profile",
      "config": {
        "profile": "goldstack-dev",
        "awsDefaultRegion": "us-west-2",
        "awsCredentialsFileName": "${path.resolve('./testData/awsCredentials').replace(/\\/g, '/')}"
      }
    }
  ]
}`;

    mkdir('-p', testDir);
    write(awsConfig, `${testDir}/config.json`);

    const providerDev = await getAWSUser('dev', `${testDir}/config.json`);
    assert(providerDev);

    // cannot validate in v3
    // const credentialsDev = await getAWSCredentials(providerDev);
    // expect(credentialsDev.secretAccessKey).toEqual('devsecret');
    // expect(credentialsDev.accessKeyId).toEqual('devkey');
  });

  it('Should load credentials using a credentials source defined in the credentials file', async () => {
    const testDir = './goldstackLocal/tests/getAWSUser';

    const awsConfig = `{
  "users": [
    {
      "name": "process",
      "type": "profile",
      "config": {
        "profile": "with-process",
        "awsDefaultRegion": "us-west-2",
        "credentialsSource": "process",
        "awsCredentialsFileName": "${path.resolve('./testData/awsCredentials').replace(/\\/g, '/')}"
      }
    }
  ]
}`;

    mkdir('-p', testDir);
    write(awsConfig, `${testDir}/config.json`);

    const providerProcess = await getAWSUser('process', `${testDir}/config.json`);
    assert(providerProcess);

    // cannot validate in v3
    // const credentialsProcess = await getAWSCredentials(providerProcess);
    // expect(credentialsProcess.secretAccessKey).toEqual('processsecret');
    // expect(credentialsProcess.accessKeyId).toEqual('processkey');
  });

  it('Should load credentials using a credentials source defined in the config file', async () => {
    const testDir = './goldstackLocal/tests/getAWSUser';

    const awsConfig = `{
  "users": [
    {
      "name": "process-from-config",
      "type": "profile",
      "config": {
        "profile": "with-process",
        "awsDefaultRegion": "us-west-2",
        "credentialsSource": "process",
        "awsConfigFileName": "${path.resolve('./testData/awsConfig').replace(/\\/g, '/')}"
      }
    }
  ]
}`;

    mkdir('-p', testDir);
    write(awsConfig, `${testDir}/config.json`);

    const provider = await getAWSUser('process-from-config', `${testDir}/config.json`);
    assert(provider);

    // cannot validate in v3
    // const credentialsProcessFromConfig = await getAWSCredentials(provider);
    // expect(credentialsProcessFromConfig.secretAccessKey).toEqual(
    //   'processsecret'
    // );
    // expect(credentialsProcessFromConfig.accessKeyId).toEqual('processkey');
  });
});
