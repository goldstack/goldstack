import { info } from '@goldstack/utils-log';
import { readPackageConfigFromDir } from '@goldstack/utils-package';
import { read } from '@goldstack/utils-sh';
import { yarn } from '@goldstack/utils-yarn';
import type { RunTestParams, TemplateTest } from './../types/TemplateTest';

export class DeployTest implements TemplateTest {
  getName(): string {
    return 'deploy';
  }
  async runTest(params: RunTestParams): Promise<void> {
    const packageConfig = readPackageConfigFromDir(params.packageDir);
    const packageJson = JSON.parse(read(params.packageDir + 'package.json'));

    for (const deployment of packageConfig.deployments) {
      info('Deploying: ' + deployment.name);
      yarn(params.projectDir, `workspace ${packageJson.name} deploy ${deployment.name}`);
    }
  }
}
