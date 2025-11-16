import { yarn } from '@goldstack/utils-yarn';
import type { RunTestParams, TemplateTest } from '../types/TemplateTest';

export class PackageBuildTest implements TemplateTest {
  getName(): string {
    return 'package-build';
  }
  async runTest(params: RunTestParams): Promise<void> {
    const packageDir = params.packageDir;

    const projectDir = params.projectDir;

    yarn(projectDir, 'clean');
    yarn(projectDir, 'build');

    yarn(packageDir, 'clean');
    yarn(packageDir, 'build');

    // compile should work as stand alone command (already tested with build implicitly before)
    yarn(packageDir, 'compile');

    // testing clean after build
    yarn(packageDir, 'clean');

    // ensure all dist files available for testing
    yarn(packageDir, 'build');
  }
}
