export * from './types/UserManagementPackage';

import * as tokenVerify from './cognitoTokenVerify';

import { getEndpoint as getEndpointLib } from './cognitoEndpoints';

import type { CognitoManager } from './cognitoTokenVerify';
export type { CognitoManager } from './cognitoTokenVerify';

export async function connectWithCognito(args: {
  goldstackConfig: any;
  packageSchema: any;
  deploymentsOutput: any;
  deploymentName?: string;
}): Promise<CognitoManager> {
  return tokenVerify.connectWithCognito(args);
}

export type Endpoint = 'authorize';

export async function getEndpoint(args: {
  goldstackConfig: any;
  endpoint: Endpoint;
  packageSchema: any;
  deploymentsOutput: any;
  deploymentName?: string;
}): Promise<string> {
  return getEndpointLib(args);
}
