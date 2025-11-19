import { read } from '@goldstack/utils-sh';
import { yarn } from '@goldstack/utils-yarn';
import path from 'path';
import type { RunTestParams, TemplateTest } from '../types/TemplateTest';

export class IgnoreMissingDeploymentsTest implements TemplateTest {
  getName(): string {
    return 'ignore-missing-deployments-test';
  }

  async runTest(params: RunTestParams): Promise<void> {
    const packageJsonPath = path.join(params.packageDir, 'package.json');
    const packageJson = JSON.parse(read(packageJsonPath));
    const fakeDeploymentName = 'non-existent-deployment-test';

    // Test without flag - should fail
    let failedAsExpected = false;
    try {
      yarn(params.projectDir, `workspace ${packageJson.name} infra plan ${fakeDeploymentName}`);
    } catch (e) {
      failedAsExpected = true;
      console.log('Command failed as expected without --ignore-missing-deployments flag');
    }

    if (!failedAsExpected) {
      throw new Error(
        'Expected command to fail without --ignore-missing-deployments flag, but it succeeded',
      );
    }

    // Test with flag - should succeed with warning
    yarn(
      params.projectDir,
      `workspace ${packageJson.name} infra plan ${fakeDeploymentName} --ignore-missing-deployments`,
    );
    console.log('Command succeeded with --ignore-missing-deployments flag');
  }
}
