import { getAWSUser } from './infraAws';
import { write, mkdir } from '@goldstack/utils-sh';
import assert from 'assert';
import path from 'path';

describe('AWS User config', () => {
  it.skip('Should read from AWS config in user folder if no config provided', async () => {
    // Skip if not in CI https://docs.github.com/en/actions/learn-github-actions/environment-variables#default-environment-variables
    if (!process.env.GITHUB_ACTIONS) {
      return;
    }

    console.log('perform test on ci');
    const awsConfig = `
[default]
aws_access_key_id=fromProfileKey
aws_secret_access_key=fromProfileSecret
    `;

    write(awsConfig, './~/.aws/config');

    const credentials = await getAWSUser('default', './invalid');
    expect(credentials.accessKeyId).toEqual('fromProfileKey');
    expect(credentials.secretAccessKey).toEqual('fromProfileSecret');
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
        "awsCredentialsFileName": "${path
          .resolve('./testData/awsCredentials')
          .replace(/\\/g, '/')}"
      }
    }
  ]
}`;

    mkdir('-p', testDir);
    write(awsConfig, testDir + '/config.json');

    const credentialsDev = await getAWSUser('dev', testDir + '/config.json');
    expect(credentialsDev.secretAccessKey).toEqual('devsecret');
    expect(credentialsDev.accessKeyId).toEqual('devkey');
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
        "awsCredentialsFileName": "${path
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
        "awsConfigFileName": "${path
          .resolve('./testData/awsConfig')
          .replace(/\\/g, '/')}"
      }
    }
  ]
}`;

    mkdir('-p', testDir);
    write(awsConfig, testDir + '/config.json');

    const credentialsProcessFromConfig = await getAWSUser(
      'process-from-config',
      testDir + '/config.json'
    );
    expect(credentialsProcessFromConfig.secretAccessKey).toEqual(
      'processsecret'
    );
    expect(credentialsProcessFromConfig.accessKeyId).toEqual('processkey');
  });
});
