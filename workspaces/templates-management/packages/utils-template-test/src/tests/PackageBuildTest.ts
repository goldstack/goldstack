import { yarn } from '@goldstack/utils-yarn';
import { TemplateTest, RunTestParams } from '../types/TemplateTest';

export class PackageBuildTest implements TemplateTest {
  getName(): string {
    return 'package-build';
  }
  async runTest(params: RunTestParams): Promise<void> {
    const packageDir = params.packageDir;

    yarn(packageDir, 'clean');
    yarn(packageDir, 'build');

    // compile should work as stand alone command (already tested with build implicitly before)
    yarn(packageDir, 'compile');

    // tests should work
    yarn(packageDir, 'test');

    // testing clean after build
    yarn(packageDir, 'clean');

    // ensure all dist files available for testing
    yarn(packageDir, 'build');
  }
}
