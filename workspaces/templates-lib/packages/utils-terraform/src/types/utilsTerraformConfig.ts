import { Deployment } from '@goldstack/infra';

/**
 * Name of the property that should be converted into a Terraform variable.
 *
 * @title Terraform Variable
 *
 */
export type TerraformVariable = string;

/**
 * Key used for Terraform state persisted in Terraform state bucket.
 *
 * Will be auto-generated upon first deployment if not provided.
 *
 * @title Terraform State Key
 */
export type TerraformStateKey = string;

/**
 * Version of Terraform that the remote state for this deployment was created with.
 *
 * Go to the next version using `yarn infra upgrade [deploymentName] [targetVersion]`. Note that Terraform versions should only be increased one at a time, so for instance you can go from v0.12 to v0.13 but not from v0.12 to v0.14.
 *
 * @default '0.12'
 */
export type TerraformVersion =
  | '0.12'
  | '0.13'
  | '0.14'
  | '0.15'
  | '1.0'
  | '1.1'
  | '1.2'
  | '1.3'
  | '1.3'
  | '1.4'
  | '1.5'
  | '1.6'
  | '1.7';

/**
 * Define which of the deployment variables will be made available for terraform.
 *
 * @title Terraform Variables
 */
export type TerraformVariables = TerraformVariable[];

export interface TerraformDeployment extends Deployment {
  terraformVariables?: TerraformVariables;
  tfStateKey?: TerraformStateKey;
  tfVersion?: TerraformVersion;
}
