/**
 * The prefix to be used for names of the generated lambdas for the API endpoints.
 *
 * @title Lambda Name Prefix
 * @pattern ^[A-Za-z0-9-_]*$
 */
type LambdaNamePrefix = string;

/**
 * The domain name that the API should be deployed to (e.g. api.mysite.com)
 *
 * @title API Domain
 * @pattern ^[^\s]*
 */
export type APIDomain = string;

/**
 * The domain name of the Route 53 hosted zone that the domain for this API should be added to.
 *
 * @title Hosted Zone Domain
 * @pattern ^[^\s]*
 */
export type HostedZoneDomain = string;

/**
 * Optional URL for an UI that should be allowed to access this server.
 *
 * @title CORS Header
 * @pattern ^[^\s]*
 */
export type CorsHeader = string;

export interface LambdaRouteConfig {
  function_name: string;
  route: string;
}

export type LambdaRoutesConfig = {
  [key: string]: LambdaRouteConfig;
};

export interface LambdaApiDeploymentConfiguration {
  lambdaNamePrefix?: LambdaNamePrefix;
  apiDomain: APIDomain;
  hostedZoneDomain: HostedZoneDomain;
  cors?: CorsHeader;
  lambdas: LambdaRoutesConfig;
}
