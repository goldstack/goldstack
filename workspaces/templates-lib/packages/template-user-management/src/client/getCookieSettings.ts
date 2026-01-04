import { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';
import type UserManagementPackage from '../types/UserManagementPackage';
import type { UserManagementDeployment } from '../types/UserManagementPackage';
import { getDeploymentName } from '../userManagementConfig';

export interface GetCookieSettingsResult {
  cookieDomain: string;
  cookieSameSite: string;
}

/**
 * Gets cookie settings for the current deployment
 */
export function getCookieSettings(args: {
  goldstackConfig: unknown;
  packageSchema: unknown;
  deploymentsOutput: unknown;
  deploymentName?: string | undefined;
}): GetCookieSettingsResult {
  const deploymentName = getDeploymentName(args.deploymentName);
  if (deploymentName === 'local') {
    return {
      cookieDomain: 'localhost',
      cookieSameSite: 'None',
    };
  }
  const packageConfig = new EmbeddedPackageConfig<UserManagementPackage, UserManagementDeployment>({
    goldstackJson: args.goldstackConfig,
    packageSchema: args.packageSchema,
  });
  // only store access and id token in cookie
  const config = packageConfig.getDeployment(deploymentName).configuration;
  return {
    cookieDomain: config.cookieDomain,
    cookieSameSite: config.cookieSameSite,
  };
}
