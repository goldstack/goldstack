import { readPackageConfigFromDir } from '@goldstack/utils-package';
import { read } from '@goldstack/utils-sh';
import { yarn } from '@goldstack/utils-yarn';
import type { RunTestParams, TemplateTest } from './../types/TemplateTest';

export class InfraUpTest implements TemplateTest {
  getName(): string {
    return 'infra-up';
  }
  async runTest(params: RunTestParams): Promise<void> {
    const packageConfig = readPackageConfigFromDir(params.packageDir);
    const packageJson = JSON.parse(read(`${params.packageDir}package.json`));

    for (const deployment of packageConfig.deployments) {
      console.log('Building infrastructure for', deployment.name);
      process.env.GOLDSTACK_DEBUG = 'true';
      // ensuring required dist files are available
      yarn(params.projectDir, `workspace ${packageJson.name} build`);
      yarn(params.projectDir, `workspace ${packageJson.name} infra init ${deployment.name}`);
      yarn(params.projectDir, `workspace ${packageJson.name} infra plan ${deployment.name}`);
      yarn(params.projectDir, `workspace ${packageJson.name} infra apply ${deployment.name}`);
    }
  }
}
