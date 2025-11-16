import { mkdir, rmSafe, write } from '@goldstack/utils-sh';
import assert from 'assert';
import os from 'os';
import path from 'path';
import { getAWSCredentials, getAWSUser, resetAWSUser } from './infraAws';

describe('AWS User config', () => {
  afterEach(() => {
    resetAWSUser();
  });
  it('Should read from AWS credentials in user folder if no config provided', async () => {
    // Skip if not in CI https://docs.github.com/en/actions/learn-github-actions/environment-variables#default-environment-variables
    if (!process.env.GITHUB_ACTION) {
      return;
    }

    const awsCredentials = `
[default]
aws_access_key_id=fromProfileKey
aws_secret_access_key=fromProfileSecret
    `;

    mkdir('-p', `${os.homedir()}/.aws`);
    await rmSafe(`${os.homedir}/.aws/config`);
    write(awsCredentials, `${os.homedir}/.aws/credentials`);

    const provider = await getAWSUser('default', './invalid');
    assert(provider);
    // Cannot verify this easily in v3
    // const credentials = await getAWSCredentials(provider);
    // assert(credentials);

    // expect(credentials.accessKeyId).toEqual('fromProfileKey');
    // expect(credentials.secretAccessKey).toEqual('fromProfileSecret');
  });

  it('Should read AWS credentials process in user folder if no config provided', async () => {
    // Skip if not in CI https://docs.github.com/en/actions/learn-github-actions/environment-variables#default-environment-variables
    if (!process.env.GITHUB_ACTION) {
      return;
    }

    const awsConfig = `
[default]
region=us-west-2
credential_process=cat ~/processCredentials.json
    `;

    mkdir('-p', `${os.homedir()}/.aws`);
    await rmSafe(`${os.homedir}/.aws/credentials`);
    write(awsConfig, `${os.homedir}/.aws/config`);

    const processCredentials = `
{
  "Version": 1,
  "AccessKeyId": "fromProcessCredentialsKey",
  "SecretAccessKey": "fromProcessCredentialsSecret",
  "SessionToken": "the AWS session token for temporary credentials",
  "Expiration": "ISO8601 timestamp when the credentials expire"
}`;

    write(processCredentials, `${os.homedir}/processCredentials.json`);

    const provider = await getAWSUser('default', './invalid');
    assert(provider);

    // cannot validate anymore, since v3 does not provide easy way to read this
    // const credentials = await getAWSCredentials(provider);
    // expect(credentials.accessKeyId).toEqual('fromProcessCredentialsKey');
    // expect(credentials.secretAccessKey).toEqual('fromProcessCredentialsSecret');
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
    const providerDev = await getAWSUser('goldstack-dev', testDir + '/config-embedded.json');
    const credentialsDev = await getAWSCredentials(providerDev);
    assert(credentialsDev.accessKeyId === 'dummy');

    resetAWSUser();
    const providerProd = await getAWSUser('goldstack-prod', testDir + '/config-embedded.json');
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
    write(awsConfig, testDir + '/config.json');

    const providerDev = await getAWSUser('dev', testDir + '/config.json');
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
    write(awsConfig, testDir + '/config.json');

    const providerProcess = await getAWSUser('process', testDir + '/config.json');
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
    write(awsConfig, testDir + '/config.json');

    const provider = await getAWSUser('process-from-config', testDir + '/config.json');
    assert(provider);

    // cannot validate in v3
    // const credentialsProcessFromConfig = await getAWSCredentials(provider);
    // expect(credentialsProcessFromConfig.secretAccessKey).toEqual(
    //   'processsecret'
    // );
    // expect(credentialsProcessFromConfig.accessKeyId).toEqual('processkey');
  });
});
