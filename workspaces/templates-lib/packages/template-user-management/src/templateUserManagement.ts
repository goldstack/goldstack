export * from './types/UserManagementPackage';

import * as tokenVerify from './cognitoTokenVerify';
import * as userManagementServerMock from './userManagementServerMock';
import * as userManagementClientMock from './userManagementClientMock';
import * as cognitoClientAuth from './cognitoClientAuth';

import { getEndpoint as getEndpointLib } from './cognitoEndpoints';
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
  if (typeof window === 'undefined') {
    return undefined;
  }
  return userManagementClientMock.getMockedUserIdToken();
}

export function setMockedUserIdToken(
  propertiesOrToken: CognitoIdTokenPayload | object | string | undefined
) {
  if (typeof window === 'undefined') {
    return undefined;
  }
  return userManagementClientMock.setMockedUserIdToken(propertiesOrToken);
}

export function getMockedUserAccessToken() {
  if (typeof window === 'undefined') {
    return undefined;
  }
  return userManagementClientMock.getMockedUserAccessToken();
}

export function setMockedUserAccessToken(
  propertiesOrToken: CognitoAccessTokenPayload | object | string | undefined
) {
  if (typeof window === 'undefined') {
    return undefined;
  }
  return userManagementClientMock.setMockedUserAccessToken(propertiesOrToken);
}

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

function setCookie(
  name: string,
  value: string,
  minutes: number,
  domain: string,
  sameSite: string
) {
  let expires: string;
  if (minutes) {
    const date = new Date();
    date.setTime(date.getTime() + minutes * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  } else {
    expires = '';
  }
  document.cookie =
    name +
    '=' +
    value +
    expires +
    `; path=/; domain=${domain}; SameSite=${sameSite}; Secure`;
}

function eraseCookie(name: string) {
  document.cookie = name + '=; Max-Age=0; SameSite=Strict';
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
 * <p>Obtains the information for a user if a user is logged in.
 * <p>Use <code>performClientAuth</code> to perform a login action.
 */
export function getLoggedInUser(): ClientAuthResult | undefined {
  if (forceLogout) {
    return;
  }
  // const deploymentName = getDeploymentName(args.deploymentName);

  // if running on the server, such as for rendering a page for SSR, client auth
  // cannot be performed
  if (typeof window === 'undefined') {
    return;
  }
  const existingAccessToken = window.sessionStorage.getItem(
    'goldstack_access_token'
  );
  const existingIdToken = window.sessionStorage.getItem('goldstack_id_token');
  if (existingAccessToken && existingIdToken) {
    return {
      accessToken: existingAccessToken,
      idToken: existingIdToken,
    };
  }
  return;
}

/**
 * <p>Returns true if a user is authenticated
 */
export function isAuthenticated(): boolean {
  return getLoggedInUser() !== undefined;
}

export async function handleRedirectCallback(args: {
  goldstackConfig: any;
  packageSchema: any;
  deploymentsOutput: any;
  deploymentName?: string;
}): Promise<ClientAuthResult | undefined> {
  // if running on the server, such as for rendering a page for SSR, client auth
  // cannot be performed
  if (typeof window === 'undefined') {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code) {
    return;
  }
  const deploymentName = getDeploymentName(args.deploymentName);

  const token = await getAndPersistToken({ ...args, code });
  const packageConfig = new EmbeddedPackageConfig<
    UserManagementPackage,
    UserManagementDeployment
  >({
    goldstackJson: args.goldstackConfig,
    packageSchema: args.packageSchema,
  });

  if (deploymentName === 'local') {
    window.location.href = window.location.href.replace(
      '?code=dummy-local-client-code',
      ''
    );
  } else {
    const deployment = packageConfig.getDeployment(deploymentName);
    window.location.href = deployment.configuration.callbackUrl;
  }
  if (!token) {
    return;
  }
  return {
    accessToken: token.accessToken,
    idToken: token.idToken,
  };
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

async function operationWithRedirect(args: {
  goldstackConfig: any;
  packageSchema: any;
  deploymentsOutput: any;
  deploymentName?: string;
  operation: 'authorize' | 'signup';
}): Promise<ClientAuthResult | undefined> {
  if (forceLogout) {
    return;
  }
  const deploymentName = getDeploymentName(args.deploymentName);

  // if running on the server, such as for rendering a page for SSR, client auth
  // cannot be performed
  if (typeof window === 'undefined') {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  // const existingAccessToken = window.sessionStorage.getItem(
  //   'goldstack_access_token'
  // );
  // const existingIdToken = window.sessionStorage.getItem('goldstack_id_token');

  // if (existingAccessToken && existingIdToken) {
  //   // remove code from URL
  //   if (code) {
  //     const packageConfig = new EmbeddedPackageConfig<
  //       UserManagementPackage,
  //       UserManagementDeployment
  //     >({
  //       goldstackJson: args.goldstackConfig,
  //       packageSchema: args.packageSchema,
  //     });
  //     const deployment = packageConfig.getDeployment(deploymentName);
  //     window.location.href = deployment.configuration.callbackUrl;
  //     return {
  //       accessToken: existingAccessToken,
  //       idToken: existingIdToken,
  //     };
  //   }

  //   return {
  //     accessToken: existingAccessToken,
  //     idToken: existingIdToken,
  //   };
  // }

  // do not redirect in Jest tests
  if (typeof process !== 'undefined' && typeof jest !== 'undefined') {
    const token = await getAndPersistToken({
      ...args,
      code: 'dummy-local-client-code',
    });
    if (!token) {
      return;
    }
    return {
      accessToken: token.accessToken,
      idToken: token.idToken,
    };
  }

  if (code) {
    return await handleRedirectCallback(args);
  }

  if (deploymentName === 'local') {
    if (getMockedUserAccessToken() === undefined) {
      return;
    }
    window.location.href = '?code=dummy-local-client-code';
    return;
  }

  const refreshToken = refreshTokenStorage;
  // if there is a refresh token, try to get a new token with that first before doing a redirect
  if (refreshToken) {
    try {
      const token = await getAndPersistToken({ ...args, refreshToken });
      if (!token) {
        return;
      }
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

  const endpoint = await getEndpoint({ ...args, endpoint: args.operation });

  window.location.href = endpoint;
  return undefined;
}

let forceLogout = false;

async function getAndPersistToken(args: {
  goldstackConfig: any;
  packageSchema: any;
  deploymentsOutput: any;
  deploymentName?: string | undefined;
  code?: string;
  refreshToken?: string;
}) {
  const token = await getToken({ ...args });
  if (!token) {
    return;
  }
  window.sessionStorage.setItem('goldstack_access_token', token.accessToken);
  window.sessionStorage.setItem('goldstack_id_token', token.idToken);
  refreshTokenStorage = token.refreshToken;

  const deploymentName = getDeploymentName(args.deploymentName);

  let cookieDomain: string;
  let cookieSameSite: string;
  if (deploymentName === 'local') {
    cookieDomain = 'localhost';
    cookieSameSite = 'None';
  } else {
    const packageConfig = new EmbeddedPackageConfig<
      UserManagementPackage,
      UserManagementDeployment
    >({
      goldstackJson: args.goldstackConfig,
      packageSchema: args.packageSchema,
    });
    // only store access and id token in cookie
    cookieDomain =
      packageConfig.getDeployment(deploymentName).configuration.cookieDomain;

    cookieSameSite =
      packageConfig.getDeployment(deploymentName).configuration.cookieSameSite;
  }
  setCookie(
    'goldstack_access_token',
    token.accessToken,
    60,
    cookieDomain,
    cookieSameSite
  );
  setCookie(
    'goldstack_id_token',
    token.idToken,
    60,
    cookieDomain,
    cookieSameSite
  );
  return token;
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
  if (typeof window === 'undefined') {
    return;
  }

  const wasLoggedIn = window.sessionStorage.getItem('goldstack_access_token');

  refreshTokenStorage = undefined;
  eraseCookie('goldstack_access_token');
  eraseCookie('goldstack_id_token');
  window.sessionStorage.removeItem('goldstack_access_token');
  window.sessionStorage.removeItem('goldstack_id_token');
  forceLogout = true;
  const deploymentName = getDeploymentName(args.deploymentName);
  if (deploymentName === 'local') {
    if (wasLoggedIn) {
      window.location.reload();
    }
    return;
  }

  const endpoint = await getEndpoint({ ...args, endpoint: 'logout' });
  window.location.href = endpoint;
}
