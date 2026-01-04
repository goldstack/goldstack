export interface TerraformState {
  [propName: string]: unknown;
}

export interface DeploymentState {
  name: string;
  terraform?: TerraformState;

  [propName: string]: unknown;
}

export type DeploymentsState = DeploymentState[];
