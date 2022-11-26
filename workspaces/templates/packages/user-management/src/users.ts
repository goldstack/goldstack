import {
  connectWithCognito as templateConnect,
  getEndpoint as templateGetEndpoint,
  CognitoManager,
  Endpoint,
} from '@goldstack/template-user-management';

import goldstackConfig from './../goldstack.json';
import packageSchema from './../schemas/package.schema.json';
import deploymentsOutput from './state/deployments.json';

export async function connectWithCognito(
  deploymentName?: string
): Promise<CognitoManager> {
  return templateConnect({
    goldstackConfig,
    packageSchema,
    deploymentsOutput,
    deploymentName,
  });
}

export async function getEndpoint(
  endpoint: Endpoint,
  deploymentName?: string
): Promise<string> {
  return templateGetEndpoint({
    endpoint,
    goldstackConfig,
    packageSchema,
    deploymentsOutput,
    deploymentName,
  });
}
