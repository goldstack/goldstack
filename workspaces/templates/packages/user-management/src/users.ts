import {
  type CognitoManager,
  type Endpoint,
  type GetCookieSettingsResult,
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
  setLocalUserManager,
  setMockedUserAccessToken,
  setMockedUserIdToken,
} from '@goldstack/template-user-management';

export async function loginWithRedirect(deploymentName?: string) {
  return templateLoginWithRedirect({
    goldstackConfig,
    packageSchema,
    deploymentsOutput,
    deploymentName,
  });
}

export async function signUpWithRedirect(deploymentName?: string) {
  return templateSignUpWithRedirect({
    goldstackConfig,
    packageSchema,
    deploymentsOutput,
    deploymentName,
  });
}

export async function handleRedirectCallback(deploymentName?: string) {
  return templateHandleRedirectCallback({
    goldstackConfig,
    packageSchema,
    deploymentsOutput,
    deploymentName,
  });
}

export async function performLogout(deploymentName?: string) {
  return templatePerformLogout({
    goldstackConfig,
    packageSchema,
    deploymentsOutput,
    deploymentName,
  });
}

export async function connectWithCognito(deploymentName?: string): Promise<CognitoManager> {
  return templateConnect({
    goldstackConfig,
    packageSchema,
    deploymentsOutput,
    deploymentName,
  });
}

export async function getEndpoint(endpoint: Endpoint, deploymentName?: string): Promise<string> {
  return templateGetEndpoint({
    endpoint,
    goldstackConfig,
    packageSchema,
    deploymentsOutput,
    deploymentName,
  });
}

export function getCookieSettings(deploymentName?: string): GetCookieSettingsResult {
  return templateGetCookieSettings({
    goldstackConfig,
    packageSchema,
    deploymentsOutput,
    deploymentName,
  });
}
