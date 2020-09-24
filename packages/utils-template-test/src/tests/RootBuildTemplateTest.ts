import { TemplateTest, RunTestParams } from './../types/TemplateTest';
import { yarn } from '@goldstack/utils-yarn';

export class RootBuildTemplateTest implements TemplateTest {
  getName(): string {
    return 'root-build';
  }
  async runTest(params: RunTestParams): Promise<void> {
    const projectDir = params.projectDir;

    // formatting should work
    yarn(projectDir, 'format');
    yarn(projectDir, 'format:check');

    // linting should work
    yarn(projectDir, 'lint:fix');
    yarn(projectDir, 'lint');

    // workspace dependencies should be valid
    yarn(projectDir, 'package:doctor');

    // compile should work
    yarn(projectDir, 'compile');

    // tests should work
    yarn(projectDir, 'test:ci');

    yarn(projectDir, 'clean');
    yarn(projectDir, 'build');
  }
}
