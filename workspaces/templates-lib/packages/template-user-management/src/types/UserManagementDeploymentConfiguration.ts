import type { DeploymentConfiguration } from '@goldstack/infra';

export type { DeploymentConfiguration };

/**
 * The name of the Cognito user pool.
 *
 * @title User Pool Name
 * @pattern ^[A-Za-z0-9-]*$
 */
export type UserPoolName = string;

/**
 * The domain name of the Route 53 hosted zone that the cognito domain should be added to.
 *
 * @title Hosted Zone Domain
 * @pattern ^[^\s]*
 */
export type HostedZoneDomain = string;

/**
 * The domain where Cognito will be deployed to
 *
 * @title Cognito Domain
 * @pattern ^[^\s]*
 */
export type CognitoDomain = string;

/**
 * The domain that cookies will be set for. Consider starting the domain with a '.' if API hosted on subdomain.
 *
 * @title Cookie Domain
 * @pattern ^[^\s]*
 */
export type CookieDomain = string;

/**
 * URL that users should be redirected to after a successful login.
 *
 * @title Callback URL
 * @pattern ^[^\s]*
 */
export type CallbackUrl = string;

export interface ThisDeploymentConfiguration extends DeploymentConfiguration {
  userPoolName: UserPoolName;
  hostedZoneDomain: HostedZoneDomain;
  cognitoDomain: CognitoDomain;
  cookieDomain: CookieDomain;
  callbackUrl: CallbackUrl;
}

export type { ThisDeploymentConfiguration as UserManagementDeploymentConfiguration };
