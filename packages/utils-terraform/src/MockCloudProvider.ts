import { CloudProvider } from './cloudProvider';

export default class MockCloudProvider implements CloudProvider {
  generateEnvVariableString(): string {
    return '';
  }
  setEnvVariables(): void {
    // do nothing
  }
}
