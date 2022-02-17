import { getAWSUser } from './infraAws';
import { write, mkdir } from '@goldstack/utils-sh';
import assert from 'assert';

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
        "profile": "default",
        "awsDefaultRegion": "us-west-2"
      }
    },
    {
      "name": "prod",
      "type": "profile",
      "config": {
        "profile": "prod",
        "awsDefaultRegion": "us-west-2"
      }
    }
  ]
}`;

    mkdir('-p', testDir);
    write(awsConfig, testDir + '/config.json');
    const credentialsDefault = await getAWSUser(
      'dev',
      testDir + '/config.json'
    );
    assert(credentialsDefault.accessKeyId);
  });
});
