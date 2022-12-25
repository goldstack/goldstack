import type { Package } from '@goldstack/utils-package';

import type { UserManagementConfiguration } from './UserManagementPackageConfiguration';
import type { UserManagementDeployment } from './UserManagementDeployment';

export type { UserManagementConfiguration, UserManagementDeployment };

/**
 * Places where cognito should be deployed to.
 *
 * @title Deployments
 */
export type UserManagementDeployments = UserManagementDeployment[];

/**
 * A cognito configuration.
 *
 * @title User Management Package
 */
export interface ThisPackage extends Package {
  configuration: UserManagementConfiguration;
  deployments: UserManagementDeployments;
}

export type { ThisPackage as UserManagementPackage };

export default ThisPackage;
