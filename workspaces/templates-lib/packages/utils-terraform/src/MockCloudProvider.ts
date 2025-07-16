import type { CloudProvider } from './cloudProvider';
import type { TerraformDeployment } from './utilsTerraform';

export default class MockCloudProvider implements CloudProvider {
  getTfStateVariables(_: TerraformDeployment): [string, string][] {
    return [];
  }
  generateEnvVariableString(): string {
    return '';
  }
  setEnvVariables(): void {
    // do nothing
  }
}
