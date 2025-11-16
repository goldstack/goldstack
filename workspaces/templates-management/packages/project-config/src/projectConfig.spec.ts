import fs from 'fs';
import { getPackageConfigs } from './projectConfig';

describe('Project configuration', () => {
  it('Should read package configs', () => {
    const workspacePath = './../../../templates/';
    const configs = getPackageConfigs(workspacePath);
    const staticWebsiteConfig = configs.find(
      (config) => config.package.template === 'static-website-aws',
    );
    expect(staticWebsiteConfig?.packageSchema).toBeDefined();
    expect(staticWebsiteConfig?.pathInWorkspace).toBeDefined();
    expect(fs.existsSync(workspacePath + staticWebsiteConfig?.pathInWorkspace)).toBeTruthy();
  });
});
