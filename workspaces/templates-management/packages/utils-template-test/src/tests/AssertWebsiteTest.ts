import { TemplateTest, RunTestParams } from '../types/TemplateTest';
import { readPackageConfigFromDir } from '@goldstack/utils-package';

import assert from 'assert';

import axios from 'axios';

export const assertWebsiteAvailable = async (url: string): Promise<void> => {
  const resp = await axios.get(url);
  assert(
    resp.status === 200 || resp.status === 304,
    `HTTP call to website resulted in non success reponse code: ${resp.status} ${resp.statusText} (${url})`
  );
};

export class AssertWebsiteTest implements TemplateTest {
  getName(): string {
    return 'assert-website';
  }
  async runTest(params: RunTestParams): Promise<void> {
    const packageConfig = readPackageConfigFromDir(params.packageDir);

    for (const deployment of packageConfig.deployments) {
      console.log(
        'Asserting website deployed for',
        deployment.name,
        'deployed to',
        deployment.configuration.websiteDomain
      );

      const website1Url =
        'https://' + deployment.configuration.websiteDomain + '/';
      await assertWebsiteAvailable(website1Url);
    }
  }
}
