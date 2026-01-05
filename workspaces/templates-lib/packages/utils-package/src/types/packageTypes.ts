import type { Deployment } from '@goldstack/infra';

/**
 * Name of the template used for creating this package.
 *
 * @title Template
 * @pattern ^[^\s]*$
 */
export type Template = string;

/**
 * Latest template version that was applied to this package.
 *
 * @title Template Version
 */
export type TemplateVersion = string;

/**
 * Name of this package.
 *
 * @title Package Name
 */
export type Name = string;

/**
 * Configuration of this package
 *
 * @title Configuration
 */
export interface PackageConfiguration {
  [propName: string]: unknown;
}

/**
 * Definition for a Goldstack Package.
 *
 * @title Package
 */
export interface Package {
  template: Template;
  templateVersion: TemplateVersion;
  name: Name;
  configuration: PackageConfiguration;
  deployments: Deployment[];
  $schema: string;
}
