export * from './types/UserManagementPackage';

import * as tokenVerify from './cognitoTokenVerify';
import * as userManagementServerMock from './userManagementServerMock';
import * as userManagementClientMock from './userManagementClientMock';

import { getEndpoint as getEndpointLib } from './cognitoEndpoints';
import { getToken as getTokenLib } from './cognitoClientAuth';
import type { CognitoManager } from './cognitoTokenVerify';
import { getDeploymentName } from './userManagementConfig';
import { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';
import UserManagementPackage, {
  UserManagementDeployment,
} from './types/UserManagementPackage';
export type { CognitoManager } from './cognitoTokenVerify';

import type { GetTokenResults } from './cognitoClientAuth';
import {
  CognitoAccessTokenPayload,
  CognitoIdTokenPayload,
} from 'aws-jwt-verify/jwt-model';
export type { GetTokenResults };

export async function connectWithCognito(args: {
  goldstackConfig: any;
  packageSchema: any;
  deploymentsOutput: any;
  deploymentName?: string;
}): Promise<CognitoManager> {
  return tokenVerify.connectWithCognito(args);
}

export function getLocalUserManager(): CognitoManager {
  return userManagementServerMock.getLocalUserManager();
}

export function setLocalUserManager(userManager: CognitoManager): void {
  userManagementServerMock.setLocalUserManager(userManager);
}

export function generateTestIdToken(
  properties: CognitoIdTokenPayload | object
): string {
  return userManagementServerMock.generateTestIdToken(properties);
}

export function generateTestAccessToken(
  properties: CognitoAccessTokenPayload | object
): string {
  return userManagementServerMock.generateTestAccessToken(properties);
}

export function getMockedUserIdToken() {
  return userManagementClientMock.getMockedUserIdToken();
}

export function setMockedUserIdToken(
  propertiesOrToken: CognitoIdTokenPayload | object | string
) {
  return userManagementClientMock.setMockedUserIdToken(propertiesOrToken);
}

export function getMockedUserAccessToken() {
  return userManagementClientMock.getMockedUserAccessToken();
}

export function setMockedUserAccessToken(
  propertiesOrToken: CognitoAccessTokenPayload | object | string
) {
  return userManagementClientMock.setMockedUserAccessToken(propertiesOrToken);
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
  code?: string;
  refreshToken?: string;
  packageSchema: any;
  deploymentsOutput: any;
  deploymentName?: string;
}): Promise<GetTokenResults> {
  return getTokenLib(args);
}

function setCookie(name: string, value: string, minutes: number) {
  let expires: string;
  if (minutes) {
    const date = new Date();
    date.setTime(date.getTime() + minutes * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  } else {
    expires = '';
  }
  document.cookie = name + '=' + value + expires + '; path=/';
}

function eraseCookie(name: string) {
  document.cookie = name + '=; Max-Age=0';
}

/*
 * Keeping this only in memory
 */
let refreshTokenStorage: string | undefined = undefined;

export interface ClientAuthResult {
  accessToken: string;
  idToken: string;
}

/**
 * <p>Performs client-side authentication.
 * <p>Will redirect to Cognito hosted UI for signin if required.
 * <p>Sets client-side cookies and session variables.
 * <p>For more control on what gets persisted on the client-side, use the method <code>getToken</code>.
 */
export async function performClientAuth(args: {
  goldstackConfig: any;
  packageSchema: any;
  deploymentsOutput: any;
  deploymentName?: string;
}): Promise<ClientAuthResult | undefined> {
  const deploymentName = getDeploymentName(args.deploymentName);

  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  const existingAccessToken = window.sessionStorage.getItem(
    'goldstack_access_token'
  );
  const existingIdToken = window.sessionStorage.getItem('goldstack_id_token');
  if (existingAccessToken && existingIdToken) {
    // remove code from URL
    if (code) {
      const packageConfig = new EmbeddedPackageConfig<
        UserManagementPackage,
        UserManagementDeployment
      >({
        goldstackJson: args.goldstackConfig,
        packageSchema: args.packageSchema,
      });
      const deployment = packageConfig.getDeployment(deploymentName);
      window.location.href = deployment.configuration.callbackUrl;
      return {
        accessToken: existingAccessToken,
        idToken: existingIdToken,
      };
    }

    return {
      accessToken: existingAccessToken,
      idToken: existingIdToken,
    };
  }

  if (code) {
    const token = await getToken({ ...args, code });
    window.sessionStorage.setItem('goldstack_access_token', token.accessToken);
    window.sessionStorage.setItem('goldstack_id_token', token.idToken);
    refreshTokenStorage = token.refreshToken;
    // only store access and id token in cookie
    setCookie('goldstack_access_token', token.accessToken, 60);
    setCookie('goldstack_id_token', token.idToken, 60);
    const packageConfig = new EmbeddedPackageConfig<
      UserManagementPackage,
      UserManagementDeployment
    >({
      goldstackJson: args.goldstackConfig,
      packageSchema: args.packageSchema,
    });
    const deployment = packageConfig.getDeployment(deploymentName);
    window.location.href = deployment.configuration.callbackUrl;
    return {
      accessToken: token.accessToken,
      idToken: token.idToken,
    };
  }

  if (deploymentName === 'local') {
    window.location.href = '?code=dummy-local-code';
    return;
  }

  const refreshToken = refreshTokenStorage;
  // if there is a refresh token, try to get a new token with that first before doing a redirect
  if (refreshToken) {
    try {
      const token = await getToken({ ...args, refreshToken });

      window.sessionStorage.setItem(
        'goldstack_access_token',
        token.accessToken
      );
      window.sessionStorage.setItem('goldstack_id_token', token.idToken);
      refreshTokenStorage = token.refreshToken;
      // only store access and id token in cookie
      setCookie('goldstack_access_token', token.accessToken, 60);
      setCookie('goldstack_id_token', token.idToken, 60);

      return {
        accessToken: token.accessToken,
        idToken: token.idToken,
      };
    } catch (e) {
      // if there is an error, we better discard our refresh token, it could be expired
      refreshTokenStorage = undefined;
      // then we proceed with the redirect to login
    }
  }

  const endpoint = await getEndpoint({ ...args, endpoint: 'authorize' });

  window.location.href = endpoint;
  return undefined;
}

/**
 * <p>Will clear all cached variables set in <code>performClientAuth</code> and redirect user to the sign in page.
 * <p>If you manage your own client-side config, use <code>getEndpoint</code> to obtain the logout endpoint.
 */
export async function performLogout(args: {
  goldstackConfig: any;
  packageSchema: any;
  deploymentsOutput: any;
  deploymentName?: string;
}) {
  refreshTokenStorage = undefined;
  eraseCookie('goldstack_access_token');
  eraseCookie('goldstack_id_token');
  window.sessionStorage.removeItem('goldstack_access_token');
  window.sessionStorage.removeItem('goldstack_id_token');
  const endpoint = await getEndpoint({ ...args, endpoint: 'logout' });
  window.location.href = endpoint;
}
