import { CloudProvider } from './CloudProvider';

export default class MockCloudProvider implements CloudProvider {
  generateEnvVariableString(): string {
    return '';
  }
  setEnvVariables(): void {
    // do nothing
  }
}
