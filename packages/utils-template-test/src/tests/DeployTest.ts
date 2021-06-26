import { TemplateTest, RunTestParams } from './../types/TemplateTest';
import { yarn } from '@goldstack/utils-yarn';
import { readPackageConfigFromDir } from '@goldstack/utils-package';
import { read } from '@goldstack/utils-sh';

export class DeployTest implements TemplateTest {
  getName(): string {
    return 'deploy';
  }
  async runTest(params: RunTestParams): Promise<void> {
    const packageConfig = readPackageConfigFromDir(params.packageDir);
    const packageJson = JSON.parse(read(params.packageDir + 'package.json'));

    for (const deployment of packageConfig.deployments) {
      console.log('Deploying', deployment.name);
      yarn(
        params.projectDir,
        `workspace ${packageJson.name} deploy ${deployment.name}`
      );
    }
  }
}
