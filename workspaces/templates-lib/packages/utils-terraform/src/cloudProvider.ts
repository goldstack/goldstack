import { Package } from '@goldstack/utils-package';
import type { TerraformDeployment } from './types/utilsTerraformConfig';

export interface CloudProvider {
  generateEnvVariableString: () => string;
  setEnvVariables: () => void;
  getTfStateVariables: (deployment: TerraformDeployment) => [string, string][];
}
