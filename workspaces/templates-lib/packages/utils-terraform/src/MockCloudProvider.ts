import type { CloudProvider } from './cloudProvider';
import type { TerraformDeployment } from './utilsTerraform';

export default class MockCloudProvider implements CloudProvider {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
