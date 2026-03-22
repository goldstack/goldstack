import { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';
import type UserManagementPackage from '../types/UserManagementPackage';
import type { UserManagementDeployment } from '../types/UserManagementPackage';
import { getDeploymentName } from '../userManagementConfig';
import { getAndPersistToken } from './getAndPersistToken';
import type { ClientAuthResult } from './getLoggedInUser';
import { isValidState } from './state';

/**
 * Handles the redirect callback from the authentication provider
 */
export async function handleRedirectCallback(args: {
  goldstackConfig: any;
  packageSchema: any;
  deploymentsOutput: any;
  deploymentName?: string;
}): Promise<ClientAuthResult | undefined> {
  if (typeof window === 'undefined') {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code) {
    return;
  }
  const state = params.get('state');
  const deploymentName = getDeploymentName(args.deploymentName);

  const token = await getAndPersistToken({ ...args, code });
  const packageConfig = new EmbeddedPackageConfig<UserManagementPackage, UserManagementDeployment>({
    goldstackJson: args.goldstackConfig,
    packageSchema: args.packageSchema,
  });

  if (deploymentName === 'local') {
    let redirectUrl = window.location.href.replace('?code=dummy-local-client-code', '');
    if (state) {
      if (isValidState(state)) {
        redirectUrl = state;
      } else {
        console.warn(
          `Invalid state parameter received: "${state}". ` +
            `State must be a relative path starting with '/'. ` +
            `Redirecting to original URL instead.`,
        );
      }
    }
    window.location.href = redirectUrl;
  } else {
    const deployment = packageConfig.getDeployment(deploymentName);
    if (state) {
      if (isValidState(state)) {
        window.location.href = state;
      } else {
        console.warn(
          `Invalid state parameter received: "${state}". ` +
            `State must be a relative path starting with '/'. ` +
            `Redirecting to callback URL instead.`,
        );
        window.location.href = deployment.configuration.callbackUrl;
      }
    } else {
      window.location.href = deployment.configuration.callbackUrl;
    }
  }
  if (!token) {
    return;
  }
  return {
    accessToken: token.accessToken,
    idToken: token.idToken,
    state: state || undefined,
  };
}
