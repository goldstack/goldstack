export interface TerraformState {
  // biome-ignore lint/suspicious/noExplicitAny: Terraform state supports dynamic properties
  [propName: string]: any;
}

export interface DeploymentState {
  name: string;
  terraform?: TerraformState;

  // biome-ignore lint/suspicious/noExplicitAny: Deployment state supports dynamic properties
  [propName: string]: any;
}

export type DeploymentsState = DeploymentState[];
