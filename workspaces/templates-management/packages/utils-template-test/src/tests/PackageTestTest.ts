import { yarn } from '@goldstack/utils-yarn';
import type { TemplateTest, RunTestParams } from '../types/TemplateTest';

export class PackageTestTest implements TemplateTest {
  getName(): string {
    return 'package-test';
  }
  async runTest(params: RunTestParams): Promise<void> {
    const packageDir = params.packageDir;

    // testing clean after build
    yarn(packageDir, 'test');
  }
}
