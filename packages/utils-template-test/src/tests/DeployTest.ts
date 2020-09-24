import { TemplateTest, RunTestParams } from './../types/TemplateTest';
import { yarn } from '@goldstack/utils-yarn';
import { readPackageConfigFromDir } from '@goldstack/utils-package';

export class DeployTest implements TemplateTest {
  getName(): string {
    return 'deploy';
  }
  async runTest(params: RunTestParams): Promise<void> {
    const packageConfig = readPackageConfigFromDir(params.packageDir);

    for (const deployment of packageConfig.deployments) {
      console.log('Deploying', deployment.name);
      yarn(params.packageDir, `deploy ${deployment.name}`);
    }
  }
}
