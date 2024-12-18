import { TemplateTest, RunTestParams } from './../types/TemplateTest';
import { yarn } from '@goldstack/utils-yarn';
import { readPackageConfigFromDir } from '@goldstack/utils-package';

import { read } from '@goldstack/utils-sh';
import { retryOperation } from './Utils';
import { info, warn } from '@goldstack/utils-log';
import path from 'path';
import { existsSync } from 'fs';

export class InfraDestroyTest implements TemplateTest {
  getName(): string {
    return 'infra-destroy';
  }
  async runTest(params: RunTestParams): Promise<void> {
    const packageConfig = readPackageConfigFromDir(params.packageDir);
    const packageJson = JSON.parse(
      read(path.join(params.packageDir, 'package.json'))
    );

    if (
      !existsSync(path.join(params.packageDir, 'infra', 'aws', '.terraform'))
    ) {
      warn(
        'Skipping destroying infrastructure since terraform not initialised.'
      );
      return;
    }

    for (const deployment of packageConfig.deployments) {
      info('Destroying infrastructure for ' + deployment.name);
      await retryOperation(
        async () => {
          process.env.GOLDSTACK_DEBUG = 'true';
          yarn(
            params.projectDir,
            `workspace ${packageJson.name} infra destroy ${deployment.name} -y`
          );
        },
        120000,
        20
      );
    }
  }
}
