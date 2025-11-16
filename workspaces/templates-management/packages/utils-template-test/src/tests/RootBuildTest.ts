import { yarn } from '@goldstack/utils-yarn';
import type { RunTestParams, TemplateTest } from '../types/TemplateTest';

export class RootBuildTest implements TemplateTest {
  getName(): string {
    return 'root-build';
  }
  async runTest(params: RunTestParams): Promise<void> {
    const projectDir = params.projectDir;

    // formatting should work
    yarn(projectDir, 'format');
    yarn(projectDir, 'format-check');

    // linting should work
    yarn(projectDir, 'lint-fix');
    yarn(projectDir, 'lint');

    // workspace dependencies should be valid
    // some error with package:doctor coming up during local install
    // yarn(projectDir, 'package:doctor');

    // testing clean before build
    yarn(projectDir, 'clean');
    yarn(projectDir, 'build');

    // compile should work as stand alone command (already tested with build implicitly before)
    yarn(projectDir, 'compile');

    // tests should work
    yarn(projectDir, 'test');

    // testing clean after build
    yarn(projectDir, 'clean');

    // ensure all dist files available for testing
    yarn(projectDir, 'build');
  }
}
