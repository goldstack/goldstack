import { TemplateTest, RunTestParams } from './../types/TemplateTest';
import { yarn } from '@goldstack/utils-yarn';
import { readPackageConfigFromDir } from '@goldstack/utils-package';

export class InfraUpTest implements TemplateTest {
  getName(): string {
    return 'infra-up';
  }
  async runTest(params: RunTestParams): Promise<void> {
    const packageConfig = readPackageConfigFromDir(params.packageDir);

    for (const deployment of packageConfig.deployments) {
      console.log('Building infrastructure for', deployment.name);
      yarn(params.packageDir, `infra init ${deployment.name}`);
      yarn(params.packageDir, `infra plan ${deployment.name}`);
      yarn(params.packageDir, `infra apply ${deployment.name}`);
    }
  }
}
