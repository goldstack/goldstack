export interface TerraformState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [propName: string]: any;
}

export interface DeploymentState {
  name: string;
  terraform?: TerraformState;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [propName: string]: any;
}

export type DeploymentsState = DeploymentState[];
