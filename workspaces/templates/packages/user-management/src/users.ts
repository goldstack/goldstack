import {
  type CognitoManager,
  type Endpoint,
  type GetCookieSettingsResult,
  isValidState,
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

export type { ClientAuthResult } from '@goldstack/template-user-management';
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
 * @param deploymentName - Optional name of the deployment to use. If not provided,
 *                         uses the deployment specified in environment variables.
 * @param state - Optional state parameter to preserve through the authentication flow.
 *                Must be a relative path starting with '/' (e.g., '/app/automation/xxx').
 *                After authentication, the user will be redirected to this path instead of the callback URL.
 *                Used for preserving deep links when users need to authenticate before accessing protected routes.
 * @returns A promise that resolves when the redirect is initiated.
 */
export async function loginWithRedirect(deploymentName?: string, state?: string) {
  return templateLoginWithRedirect({
    goldstackConfig,
    packageSchema,
    deploymentsOutput,
    deploymentName,
    state,
  });
}

/**
 * Initiates the sign-up process by redirecting the user to the Cognito hosted UI.
 *
 * @param deploymentName - Optional name of the deployment to use. If not provided,
 *                         uses the deployment specified in environment variables.
 * @param state - Optional state parameter to preserve through the authentication flow.
 *                Must be a relative path starting with '/' (e.g., '/app/automation/xxx').
 *                After authentication, the user will be redirected to this path instead of the callback URL.
 *                Used for preserving deep links when users need to authenticate before accessing protected routes.
 * @returns A promise that resolves when the redirect is initiated.
 */
export async function signUpWithRedirect(deploymentName?: string, state?: string) {
  return templateSignUpWithRedirect({
    goldstackConfig,
    packageSchema,
    deploymentsOutput,
    deploymentName,
    state,
  });
}

/**
 * Handles the redirect callback from Cognito after authentication.
 * This function should be called on the page that Cognito redirects to after login/signup.
 *
 * @param deploymentName - Optional name of the deployment to use. If not provided,
 *                         uses the deployment specified in environment variables.
 * @returns A promise that resolves with the authentication result, including the state parameter if present.
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
 * @param state - Optional state parameter to include in the authorization URL.
 *                Must be a relative path starting with '/' (e.g., '/app/automation/xxx').
 * @returns A promise that resolves with the endpoint URL string.
 */
export async function getEndpoint(
  endpoint: Endpoint,
  deploymentName?: string,
  state?: string,
): Promise<string> {
  return templateGetEndpoint({
    endpoint,
    goldstackConfig,
    packageSchema,
    deploymentsOutput,
    deploymentName,
    state,
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
