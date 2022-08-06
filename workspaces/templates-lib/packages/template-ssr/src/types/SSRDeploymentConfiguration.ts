import { LambdaRoutesConfig } from '@goldstack/utils-aws-lambda';

/**
 * The prefix to be used for names of the generated lambdas for the dynamic endpoints.
 *
 * @title Lambda Name Prefix
 * @pattern ^[A-Za-z0-9-_]*$
 */
type LambdaNamePrefix = string;

/**
 * The domain name that the service should be deployed to (e.g. mysite.com)
 *
 * @title Domain
 * @pattern ^[^\s]*
 */
export type Domain = string;

/**
 * The domain name of the Route 53 hosted zone that the domain for this service should be added to.
 *
 * @title Hosted Zone Domain
 * @pattern ^[^\s]*
 */
export type HostedZoneDomain = string;

export interface SSRDeploymentConfiguration {
  lambdaNamePrefix?: LambdaNamePrefix;
  domain: Domain;
  hostedZoneDomain: HostedZoneDomain;
  lambdas: LambdaRoutesConfig;
}
