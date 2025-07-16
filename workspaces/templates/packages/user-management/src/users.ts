import {
  connectWithCognito as templateConnect,
  getEndpoint as templateGetEndpoint,
  type CognitoManager,
  type Endpoint,
  loginWithRedirect as templateLoginWithRedirect,
  signUpWithRedirect as templateSignUpWithRedirect,
  handleRedirectCallback as templateHandleRedirectCallback,
  getCookieSettings as templateGetCookieSettings,
  performLogout as templatePerformLogout,
  type GetCookieSettingsResult,
} from '@goldstack/template-user-management';

import goldstackConfig from './../goldstack.json';
import packageSchema from './../schemas/package.schema.json';
import deploymentsOutput from './state/deployments.json';

export {
  setLocalUserManager,
  setMockedUserAccessToken,
  setMockedUserIdToken,
  getMockedUserAccessToken,
  getMockedUserIdToken,
  generateTestAccessToken,
  generateTestIdToken,
  getLocalUserManager,
  getLoggedInUser,
  isAuthenticated,
} from '@goldstack/template-user-management';

export type { ClientAuthResult } from '@goldstack/template-user-management';

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
