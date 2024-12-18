import { yarn } from '@goldstack/utils-yarn';
import { TemplateTest, RunTestParams } from '../types/TemplateTest';
import { readPackageConfigFromDir } from '@goldstack/utils-package';
import { read } from '@goldstack/utils-sh';

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
