import { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';
import type UserManagementPackage from '../types/UserManagementPackage';
import type { UserManagementDeployment } from '../types/UserManagementPackage';
import { getDeploymentName } from '../userManagementConfig';
import { getAndPersistToken } from './getAndPersistToken';
import type { ClientAuthResult } from './getLoggedInUser';
import { isValidState } from './state';

/**
 * Handles the redirect callback from the authentication provider.
 *
 * Note: In browser environments, this function performs a redirect and never returns
 * to the caller. The return value is only relevant for Jest test environments and
 * server-side rendering contexts where redirects are not performed.
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

  // Determine the redirect URL based on deployment type and state
  let redirectUrl: string;
  if (deploymentName === 'local') {
    redirectUrl = window.location.href.split('?')[0];
  } else {
    const deployment = packageConfig.getDeployment(deploymentName);
    redirectUrl = deployment.configuration.callbackUrl;
  }

  // Apply state redirection if valid
  if (state) {
    if (isValidState(state)) {
      redirectUrl = state;
    } else {
      console.warn(
        `Invalid state parameter received: "${state}". ` +
          `State must be a relative path starting with '/'. ` +
          `Redirecting to callback URL instead.`,
      );
    }
  }

  // In browser environments, this redirect causes navigation and the function
  // never returns to the caller. The code below only executes in Jest tests.
  window.location.href = redirectUrl;

  if (!token) {
    return;
  }
  return {
    accessToken: token.accessToken,
    idToken: token.idToken,
    state: state || undefined,
  };
}
