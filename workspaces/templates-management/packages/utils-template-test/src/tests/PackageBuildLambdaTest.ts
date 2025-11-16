import { readPackageConfigFromDir } from '@goldstack/utils-package';
import { read } from '@goldstack/utils-sh';
import { yarn } from '@goldstack/utils-yarn';
import type { RunTestParams, TemplateTest } from '../types/TemplateTest';

export class PackageBuildLambdaTest implements TemplateTest {
  getName(): string {
    return 'package-build-lambda';
  }
  async runTest(params: RunTestParams): Promise<void> {
    const packageDir = params.packageDir;

    const packageConfig = readPackageConfigFromDir(params.packageDir);

    for (const deployment of packageConfig.deployments) {
      yarn(packageDir, `build-lambda ${deployment.name}`);
    }
  }
}
