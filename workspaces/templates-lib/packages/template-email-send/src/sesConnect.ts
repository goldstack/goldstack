import { SESClient } from '@aws-sdk/client-ses';
import { AwsCredentialIdentityProvider } from '@aws-sdk/types';
import { fromEnv } from '@aws-sdk/credential-providers';
import {
  EmailSendPackage,
  EmailSendDeployment,
} from './types/EmailSendPackage';
import assert from 'assert';

import { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';

import { excludeInBundle } from '@goldstack/utils-esbuild';

let mockedSES: SESClient | undefined;

export const getMockedSES = (): SESClient => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const createSESClient = require(excludeInBundle(
    './mockedSES'
  )).createSESClient;
  if (!mockedSES) {
    mockedSES = createSESClient();
  }
  return mockedSES as any;
};

export const connect = async (
  goldstackConfig: any,
  packageSchema: any,
  deploymentName?: string
): Promise<SESClient> => {
  const packageConfig = new EmbeddedPackageConfig<
    EmailSendPackage,
    EmailSendDeployment
  >({
    goldstackJson: goldstackConfig,
    packageSchema,
  });
  if (!deploymentName) {
    assert(
      process.env.GOLDSTACK_DEPLOYMENT,
      `Cannot connect to SES for package ${goldstackConfig.name}. Either specify a deploymentName or ensure environment variable GOLDSTACK_DEPLOYMENT is defined.`
    );
    deploymentName = process.env.GOLDSTACK_DEPLOYMENT;
  }

  if (deploymentName === 'local') {
    if (!mockedSES) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const createSESClient = require(excludeInBundle(
        './mockedSES'
      )).createSESClient;
      mockedSES = createSESClient();
    }
    return mockedSES as any;
  }

  const deployment = packageConfig.getDeployment(deploymentName);

  let awsUser: AwsCredentialIdentityProvider;
  if (process.env.AWS_ACCESS_KEY_ID) {
    awsUser = fromEnv();
  } else {
    // load this in lazy to enable omitting the dependency when bundling lambdas
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const infraAWSLib = require(excludeInBundle('@goldstack/infra-aws'));
    awsUser = await infraAWSLib.getAWSUser(deployment.awsUser);
  }
  const ses = new SESClient({
    credentials: awsUser,
    region: deployment.awsRegion,
  });

  return ses;
};

export const getFromDomain = async (
  goldstackConfig: any,
  packageSchema: any,
  deploymentName?: string
): Promise<string> => {
  const packageConfig = new EmbeddedPackageConfig<
    EmailSendPackage,
    EmailSendDeployment
  >({
    goldstackJson: goldstackConfig,
    packageSchema,
  });
  if (!deploymentName) {
    assert(
      process.env.GOLDSTACK_DEPLOYMENT,
      `Cannot connect to SES for package ${goldstackConfig.name}. Either specify a deploymentName or ensure environment variable GOLDSTACK_DEPLOYMENT is defined.`
    );
    deploymentName = process.env.GOLDSTACK_DEPLOYMENT;
  }

  if (deploymentName === 'local') {
    return 'test.local';
  }

  const deployment = packageConfig.getDeployment(deploymentName);

  return deployment.configuration.domain;
};
