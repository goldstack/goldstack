import { CloudProvider } from './cloudProvider';

export default class MockCloudProvider implements CloudProvider {
  async assertState(): Promise<void> {
    // do nothing
  }
  async destroyState(): Promise<void> {
    // do nothing
  }
  generateEnvVariableString(): string {
    return '';
  }
  setEnvVariables(): void {
    // do nothing
  }
}
