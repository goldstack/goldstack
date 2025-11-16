export * from './types/UserManagementPackage';

import { getEndpoint as getEndpointLib } from './client/getEndpoints';
import * as cognitoClientAuth from './client/getToken';

export type { CognitoManager } from './cognitoTokenVerify';

import type { GetTokenResults } from './client/getToken';
export type { GetTokenResults };

import type { ClientAuthResult } from './client/getLoggedInUser';
import { operationWithRedirect } from './client/operationWithRedirect';

export type { GetCookieSettingsResult } from './client/getCookieSettings';
export { getCookieSettings } from './client/getCookieSettings';
export type { ClientAuthResult } from './client/getLoggedInUser';
export { getLoggedInUser, isAuthenticated } from './client/getLoggedInUser';
export { handleRedirectCallback } from './client/handleRedirectCallback';
export { operationWithRedirect } from './client/operationWithRedirect';
export { performLogout } from './client/performLogout';
export { connectWithCognito } from './cognitoTokenVerify';
export {
  getMockedUserAccessToken,
  getMockedUserIdToken,
  setMockedUserAccessToken,
  setMockedUserIdToken,
} from './userManagementClientMock';
export {
  generateTestAccessToken,
  generateTestIdToken,
  getLocalUserManager,
  setLocalUserManager,
} from './userManagementServerMock';

export type Endpoint =
  | 'authorize' // https://docs.aws.amazon.com/cognito/latest/developerguide/authorization-endpoint.html
  | 'signup'
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
  code?: string;
  refreshToken?: string;
  packageSchema: any;
  deploymentsOutput: any;
  deploymentName?: string;
}): Promise<GetTokenResults | undefined> {
  return cognitoClientAuth.getToken(args);
}

/**
 * <p>Performs client-side authentication.
 * <p>Will redirect to Cognito hosted UI for sign in if required.
 * <p>Sets client-side cookies and session variables.
 * <p>For more control on what gets persisted on the client-side, use the method <code>getToken</code>.
 */
export async function loginWithRedirect(args: {
  goldstackConfig: any;
  packageSchema: any;
  deploymentsOutput: any;
  deploymentName?: string;
}): Promise<ClientAuthResult | undefined> {
  return operationWithRedirect({ ...args, operation: 'authorize' });
}

/**
 * <p>Performs client-side authentication.
 * <p>Will redirect to Cognito hosted UI for signing up if required.
 * <p>Sets client-side cookies and session variables.
 * <p>For more control on what gets persisted on the client-side, use the method <code>getToken</code>.
 */
export async function signUpWithRedirect(args: {
  goldstackConfig: any;
  packageSchema: any;
  deploymentsOutput: any;
  deploymentName?: string;
}): Promise<ClientAuthResult | undefined> {
  return operationWithRedirect({ ...args, operation: 'signup' });
}
