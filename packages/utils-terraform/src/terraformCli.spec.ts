import { mkdir } from '@goldstack/utils-sh';
import { tf } from './terraformCli';
import MockCloudProvider from './MockCloudProvider';

describe('Terraform CLI', () => {
  it('Should accept folder with spaces', async () => {
    const testDir = './goldstackLocal/cli-folder-w-space/My Dir';
    mkdir('-p', testDir);
    tf('init', {
      dir: testDir,
      provider: new MockCloudProvider(),
    });
  });
});
