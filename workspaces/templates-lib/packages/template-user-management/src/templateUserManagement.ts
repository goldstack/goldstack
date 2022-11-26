export * from './types/UserManagementPackage';

import * as tokenVerify from './cognitoTokenVerify';

import { getEndpoint as getEndpointLib } from './cognitoEndpoints';
import { getToken as getTokenLib } from './cognitoClientAuth';
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

export type Endpoint =
  | 'authorize' // https://docs.aws.amazon.com/cognito/latest/developerguide/authorization-endpoint.html
  | 'token' // https://docs.aws.amazon.com/cognito/latest/developerguide/token-endpoint.html
  | 'logout'; // https://docs.aws.amazon.com/cognito/latest/developerguide/logout-endpoint.html

export async function getEndpoint(args: {
  goldstackConfig: any;
  endpoint: Endpoint;
  packageSchema: any;
  deploymentsOutput: any;
  deploymentName?: string;
}): Promise<string> {
  return getEndpointLib(args);
}

export async function getToken(args: {
  goldstackConfig: any;
  endpoint: Endpoint;
  code: string;
  packageSchema: any;
  deploymentsOutput: any;
  deploymentName?: string;
}): Promise<string> {
  return getTokenLib(args);
}
