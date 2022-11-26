export * from './types/UserManagementPackage';

import * as tokenVerify from './cognitoTokenVerify';

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
export type { GetTokenResults };

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
  code?: string;
  refreshToken?: string;
  packageSchema: any;
  deploymentsOutput: any;
  deploymentName?: string;
}): Promise<GetTokenResults> {
  return getTokenLib(args);
}

function createCookie(name: string, value: string, minutes: number) {
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

export async function performClientAuth(args: {
  goldstackConfig: any;
  packageSchema: any;
  deploymentsOutput: any;
  deploymentName?: string;
}) {
  const deploymentName = getDeploymentName(args.deploymentName);

  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  const existingToken = window.sessionStorage.getItem('goldstack_token');
  if (existingToken) {
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
      return existingToken;
    }

    return existingToken;
  }

  if (code) {
    const token = await getToken({ ...args, code });
    window.sessionStorage.setItem('goldstack_token', token.accessToken);
    window.sessionStorage.setItem(
      'goldstack_refresh_token',
      token.refreshToken
    );
    // only store access token in cookie
    createCookie('goldstack_token', token.accessToken, 60);
    const packageConfig = new EmbeddedPackageConfig<
      UserManagementPackage,
      UserManagementDeployment
    >({
      goldstackJson: args.goldstackConfig,
      packageSchema: args.packageSchema,
    });
    const deployment = packageConfig.getDeployment(deploymentName);
    window.location.href = deployment.configuration.callbackUrl;
    return token.accessToken;
  }

  if (deploymentName === 'local') {
    window.location.href = '?code=dummy-local-code';
    return;
  }

  const refreshToken = window.sessionStorage.getItem('goldstack_refresh_token');
  // if there is a refresh token, try to get a new token with that first before doing a redirect
  if (refreshToken) {
    try {
      const token = await getToken({ ...args, refreshToken });
      return token.accessToken;
    } catch (e) {
      // if there is an error, we better discard our refresh token, it could be expired
      window.sessionStorage.removeItem('goldstack_refresh_token');
      // then we proceed with the redirect to login
    }
  }

  const endpoint = await getEndpoint({ ...args, endpoint: 'authorize' });

  window.location.href = endpoint;
  return undefined;
}
