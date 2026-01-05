export interface TerraformState {
  [propName: string]: any;
}

export interface DeploymentState {
  name: string;
  terraform?: TerraformState;

  [propName: string]: any;
}

export type DeploymentsState = DeploymentState[];
