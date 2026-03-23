import {
  type CognitoManager,
  type Endpoint,
  type GetCookieSettingsResult,
  isValidState,
  type LoginOptions,
  connectWithCognito as templateConnect,
  getCookieSettings as templateGetCookieSettings,
  getEndpoint as templateGetEndpoint,
  handleRedirectCallback as templateHandleRedirectCallback,
  loginWithRedirect as templateLoginWithRedirect,
  performLogout as templatePerformLogout,
  signUpWithRedirect as templateSignUpWithRedirect,
} from '@goldstack/template-user-management';

import goldstackConfig from './../goldstack.json';
import packageSchema from './../schemas/package.schema.json';
import deploymentsOutput from './state/deployments.json';

function parseRedirectArgs(
  deploymentNameOrOptions?: string | LoginOptions,
  options?: LoginOptions,
): { deploymentName?: string; options?: LoginOptions } {
  if (typeof deploymentNameOrOptions === 'string') {
    return { deploymentName: deploymentNameOrOptions, options };
  }
  return { options: deploymentNameOrOptions };
}

export type { ClientAuthResult, LoginOptions } from '@goldstack/template-user-management';
export {
  generateTestAccessToken,
  generateTestIdToken,
  getLocalUserManager,
  getLoggedInUser,
  getMockedUserAccessToken,
  getMockedUserIdToken,
  isAuthenticated,
  isValidState,
  setLocalUserManager,
  setMockedUserAccessToken,
  setMockedUserIdToken,
} from '@goldstack/template-user-management';

/**
 * Initiates the login process by redirecting the user to the Cognito hosted UI.
 *
 * By default, the current URL (pathname + search + hash) is automatically preserved
 * and the user will be redirected back after authentication.
 *
 * @param deploymentNameOrOptions - Either:
 *   - A string specifying the deployment name
 *   - A LoginOptions object with targetUrl or doNotPreservePath
 * @param options - Options if first parameter is deployment name string
 *
 * @example
 * // Auto-preserve current URL
 * await loginWithRedirect();
 *
 * // Specify deployment
 * await loginWithRedirect('prod');
 *
 * // Redirect to specific URL after auth
 * await loginWithRedirect({ targetUrl: '/dashboard' });
 *
 * // Skip path preservation, use callback URL
 * await loginWithRedirect({ doNotPreservePath: true });
 *
 * // Specify deployment and options
 * await loginWithRedirect('prod', { targetUrl: '/dashboard' });
 */
export async function loginWithRedirect(
  deploymentNameOrOptions?: string | LoginOptions,
  options?: LoginOptions,
) {
  const { deploymentName, options: opts } = parseRedirectArgs(deploymentNameOrOptions, options);

  return templateLoginWithRedirect({
    goldstackConfig,
    packageSchema,
    deploymentsOutput,
    deploymentName,
    options: opts,
    operation: 'authorize',
  });
}

/**
 * Initiates the sign-up process by redirecting the user to the Cognito hosted UI.
 *
 * By default, the current URL (pathname + search + hash) is automatically preserved
 * and the user will be redirected back after authentication.
 *
 * @param deploymentNameOrOptions - Either:
 *   - A string specifying the deployment name
 *   - A LoginOptions object with targetUrl or doNotPreservePath
 * @param options - Options if first parameter is deployment name string
 *
 * @example
 * // Auto-preserve current URL
 * await signUpWithRedirect();
 *
 * // Specify deployment
 * await signUpWithRedirect('prod');
 *
 * // Redirect to specific URL after auth
 * await signUpWithRedirect({ targetUrl: '/dashboard' });
 *
 * // Skip path preservation, use callback URL
 * await signUpWithRedirect({ doNotPreservePath: true });
 *
 * // Specify deployment and options
 * await signUpWithRedirect('prod', { targetUrl: '/dashboard' });
 */
export async function signUpWithRedirect(
  deploymentNameOrOptions?: string | LoginOptions,
  options?: LoginOptions,
) {
  const { deploymentName, options: opts } = parseRedirectArgs(deploymentNameOrOptions, options);

  return templateSignUpWithRedirect({
    goldstackConfig,
    packageSchema,
    deploymentsOutput,
    deploymentName,
    options: opts,
    operation: 'signup',
  });
}

/**
 * Handles the redirect callback from Cognito after authentication.
 * This function should be called on the page that Cognito redirects to after login/signup.
 *
 * Note: In browser environments, this function performs a page redirect and never returns
 * to the caller. The user will be navigated to the original URL (auto-preserved) or
 * the callback URL if doNotPreservePath was specified.
 * The return value is only relevant for Jest test environments.
 *
 * @param deploymentName - Optional name of the deployment to use. If not provided,
 *                         uses the deployment specified in environment variables.
 */
export async function handleRedirectCallback(deploymentName?: string) {
  return templateHandleRedirectCallback({
    goldstackConfig,
    packageSchema,
    deploymentsOutput,
    deploymentName,
  });
}

/**
 * Logs out the current user by clearing authentication tokens and redirecting to logout endpoint.
 *
 * @param deploymentName - Optional name of the deployment to use. If not provided,
 *                         uses the deployment specified in environment variables.
 * @returns A promise that resolves when the logout process is complete.
 */
export async function performLogout(deploymentName?: string) {
  return templatePerformLogout({
    goldstackConfig,
    packageSchema,
    deploymentsOutput,
    deploymentName,
  });
}

/**
 * Connects to AWS Cognito and returns a manager for user authentication operations.
 *
 * @param deploymentName - Optional name of the deployment to use. If not provided,
 *                         uses the deployment specified in environment variables.
 * @returns A promise that resolves with a CognitoManager instance.
 */
export async function connectWithCognito(deploymentName?: string): Promise<CognitoManager> {
  return templateConnect({
    goldstackConfig,
    packageSchema,
    deploymentsOutput,
    deploymentName,
  });
}

/**
 * Gets the endpoint URL for a specific Cognito endpoint type.
 *
 * @param endpoint - The type of endpoint to retrieve (e.g., 'authorize', 'token', 'logout').
 * @param deploymentName - Optional name of the deployment to use. If not provided,
 *                         uses the deployment specified in environment variables.
 * @returns A promise that resolves with the endpoint URL string.
 */
export async function getEndpoint(endpoint: Endpoint, deploymentName?: string): Promise<string> {
  return templateGetEndpoint({
    endpoint,
    goldstackConfig,
    packageSchema,
    deploymentsOutput,
    deploymentName,
  });
}

/**
 * Gets the cookie settings required for authentication cookies.
 *
 * @param deploymentName - Optional name of the deployment to use. If not provided,
 *                         uses the deployment specified in environment variables.
 * @returns The cookie settings including domain, secure flag, and same-site policy.
 */
export function getCookieSettings(deploymentName?: string): GetCookieSettingsResult {
  return templateGetCookieSettings({
    goldstackConfig,
    packageSchema,
    deploymentsOutput,
    deploymentName,
  });
}
