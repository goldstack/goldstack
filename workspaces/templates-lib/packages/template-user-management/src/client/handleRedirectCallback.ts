import { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';
import { getDeploymentName } from '../userManagementConfig';
import type { UserManagementDeployment } from '../types/UserManagementPackage';
import type UserManagementPackage from '../types/UserManagementPackage';
import type { ClientAuthResult } from './getLoggedInUser';
import { getAndPersistToken } from './getAndPersistToken';

/**
 * Handles the redirect callback from the authentication provider
 */
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
  const packageConfig = new EmbeddedPackageConfig<UserManagementPackage, UserManagementDeployment>({
    goldstackJson: args.goldstackConfig,
    packageSchema: args.packageSchema,
  });

  if (deploymentName === 'local') {
    window.location.href = window.location.href.replace('?code=dummy-local-client-code', '');
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
