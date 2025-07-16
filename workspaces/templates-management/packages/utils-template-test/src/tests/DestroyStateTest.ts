import type { TemplateTest, RunTestParams } from './../types/TemplateTest';
import { yarn } from '@goldstack/utils-yarn';
import { readPackageConfigFromDir } from '@goldstack/utils-package';

import { read } from '@goldstack/utils-sh';
import { retryOperation } from './Utils';
import { info } from '@goldstack/utils-log';

export class DestroyStateTest implements TemplateTest {
  getName(): string {
    return 'destroy-state';
  }
  async runTest(params: RunTestParams): Promise<void> {
    const packageConfig = readPackageConfigFromDir(params.packageDir);
    const packageJson = JSON.parse(read(params.packageDir + 'package.json'));

    for (const deployment of packageConfig.deployments) {
      info('Destroying remote state for ' + deployment.name);
      await retryOperation(
        async () => {
          process.env.GOLDSTACK_DEBUG = 'true';
          yarn(
            params.projectDir,
            `workspace ${packageJson.name} infra destroy-state ${deployment.name} -y`
          );
        },
        120000,
        20
      );
    }
  }
}
