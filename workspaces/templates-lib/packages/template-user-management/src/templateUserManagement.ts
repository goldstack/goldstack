export * from './types/UserManagementPackage';

import { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';
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
export { isValidState } from './client/state';
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

import type UserManagementPackage from './types/UserManagementPackage';
import type { UserManagementDeployment } from './types/UserManagementPackage';
import { getDeploymentName } from './userManagementConfig';

export type Endpoint =
  | 'authorize' // https://docs.aws.amazon.com/cognito/latest/developerguide/authorization-endpoint.html
  | 'signup'
  | 'token' // https://docs.aws.amazon.com/cognito/latest/developerguide/token-endpoint.html
  | 'logout'; // https://docs.aws.amazon.com/cognito/latest/developerguide/logout-endpoint.html

/**
 * Options for login and signup redirect operations.
 */
export interface LoginOptions {
  /**
   * Override the URL to redirect to after authentication.
   * By default, the current URL (pathname + search + hash) is preserved.
   * Must be a relative path starting with '/' (e.g., '/app/dashboard').
   */
  targetUrl?: string;
  /**
   * If true, redirect to the callback URL instead of preserving the current path.
   * Useful when you want to always redirect to a default page after authentication.
   */
  doNotPreservePath?: boolean;
}

/**
 * Internal arguments for redirect operations.
 */
export interface RedirectArgs {
  goldstackConfig: any;
  packageSchema: any;
  deploymentsOutput: any;
  deploymentName?: string;
  options?: LoginOptions;
  operation: 'authorize' | 'signup';
}

/**
 * Determines the target URL after authentication.
 * Auto-captures current URL unless doNotPreservePath is set.
 * Excludes callback URL from auto-capture.
 */
function determineTargetUrl(
  options: LoginOptions | undefined,
  deploymentName: string | undefined,
  packageConfig: EmbeddedPackageConfig<UserManagementPackage, UserManagementDeployment>,
): string | undefined {
  if (options?.doNotPreservePath) {
    return undefined;
  }

  if (options?.targetUrl) {
    return options.targetUrl;
  }

  // Auto-capture current URL
  if (typeof window === 'undefined') {
    return undefined;
  }

  const currentUrl = window.location.pathname + window.location.search + window.location.hash;

  // Exclude callback URL from auto-capture
  try {
    const deployment = packageConfig.getDeployment(deploymentName || 'default');
    const callbackUrl = deployment.configuration.callbackUrl;
    const callbackPath = new URL(callbackUrl).pathname;

    if (window.location.pathname === callbackPath) {
      return undefined;
    }
  } catch (e) {
    // If we can't parse callback URL, proceed with auto-capture
    console.warn('Could not parse callback URL from configuration. Proceeding with auto-capture.', e);
  }

  return currentUrl || undefined;
}

export async function getEndpoint(args: {
  goldstackConfig: any;
  endpoint: Endpoint;
  packageSchema: any;
  deploymentsOutput: any;
  deploymentName?: string;
  state?: string;
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
 * Performs client-side authentication.
 * Will redirect to Cognito hosted UI for sign in if required.
 * Sets client-side cookies and session variables.
 *
 * By default, the current URL (pathname + search + hash) is automatically preserved
 * and the user will be redirected back after authentication.
 *
 * @example
 * // Auto-preserve current URL
 * await loginWithRedirect(args);
 *
 * // Specify deployment
 * await loginWithRedirect({ ...args, deploymentName: 'prod' });
 *
 * // Redirect to specific URL after auth
 * await loginWithRedirect({ ...args, options: { targetUrl: '/dashboard' } });
 *
 * // Skip path preservation
 * await loginWithRedirect({ ...args, options: { doNotPreservePath: true } });
 */
async function performRedirect(args: RedirectArgs): Promise<ClientAuthResult | undefined> {
  const packageConfig = new EmbeddedPackageConfig<UserManagementPackage, UserManagementDeployment>({
    goldstackJson: args.goldstackConfig,
    packageSchema: args.packageSchema,
  });

  const state = determineTargetUrl(args.options, args.deploymentName, packageConfig);

  return operationWithRedirect({
    goldstackConfig: args.goldstackConfig,
    packageSchema: args.packageSchema,
    deploymentsOutput: args.deploymentsOutput,
    deploymentName: args.deploymentName,
    operation: args.operation,
    state,
  });
}

export async function loginWithRedirect(
  args: Omit<RedirectArgs, 'operation'>,
): Promise<ClientAuthResult | undefined> {
  return performRedirect({ ...args, operation: 'authorize' });
}

/**
 * Performs client-side sign up.
 * Will redirect to Cognito hosted UI for signing up if required.
 * Sets client-side cookies and session variables.
 *
 * By default, the current URL (pathname + search + hash) is automatically preserved
 * and the user will be redirected back after authentication.
 *
 * @example
 * // Auto-preserve current URL
 * await signUpWithRedirect(args);
 *
 * // Specify deployment
 * await signUpWithRedirect({ ...args, deploymentName: 'prod' });
 *
 * // Redirect to specific URL after auth
 * await signUpWithRedirect({ ...args, options: { targetUrl: '/dashboard' } });
 *
 * // Skip path preservation
 * await signUpWithRedirect({ ...args, options: { doNotPreservePath: true } });
 */
export async function signUpWithRedirect(
  args: Omit<RedirectArgs, 'operation'>,
): Promise<ClientAuthResult | undefined> {
  return performRedirect({ ...args, operation: 'signup' });
}
