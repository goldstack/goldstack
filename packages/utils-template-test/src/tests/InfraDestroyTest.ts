import { TemplateTest, RunTestParams } from './../types/TemplateTest';
import { yarn } from '@goldstack/utils-yarn';
import { readPackageConfigFromDir } from '@goldstack/utils-package';

import { read } from '@goldstack/utils-sh';
export class InfraDestroyTest implements TemplateTest {
  getName(): string {
    return 'infra-destroy';
  }
  async runTest(params: RunTestParams): Promise<void> {
    const packageConfig = readPackageConfigFromDir(params.packageDir);
    const packageJson = JSON.parse(read(params.packageDir + 'package.json'));

    for (const deployment of packageConfig.deployments) {
      console.log('Destroying infrastructure for', deployment.name);
      yarn(
        params.projectDir,
        `workspace ${packageJson.name} infra destroy ${deployment.name} -y`
      );
    }
  }
}
