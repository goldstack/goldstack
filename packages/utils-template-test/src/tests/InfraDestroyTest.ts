import { TemplateTest, RunTestParams } from './../types/TemplateTest';
import { yarn } from '@goldstack/utils-yarn';
import { readPackageConfigFromDir } from '@goldstack/utils-package';

export class InfraDestroyTest implements TemplateTest {
  getName(): string {
    return 'infra-destroy';
  }
  async runTest(params: RunTestParams): Promise<void> {
    const packageConfig = readPackageConfigFromDir(params.packageDir);

    for (const deployment of packageConfig.deployments) {
      console.log('Destroying infrastructure for', deployment.name);
      yarn(params.packageDir, `infra destroy ${deployment.name} -y`);
    }
  }
}
