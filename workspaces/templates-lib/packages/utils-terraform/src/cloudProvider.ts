import type { TerraformDeployment } from './types/utilsTerraformConfig';

export interface CloudProvider {
  generateEnvVariableString: () => string;
  setEnvVariables: () => void;
  getTfStateVariables: (deployment: TerraformDeployment) => [string, string][];
}
