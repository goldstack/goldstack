import { Deployment } from '@goldstack/infra';

/**
 * Name of the property that should be converted into a Terraform variable.
 *
 * @title Terraform Variable
 *
 */
export type TerraformVariable = string;

/**
 * Define which of the deployment variables will be made available for terraform.
 *
 * @title Terraform Variables
 */
export type TerraformVariables = TerraformVariable[];

export interface TerraformDeployment extends Deployment {
  terraformVariables?: TerraformVariables;
}
