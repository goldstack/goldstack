import { TemplateTest, RunTestParams } from '../types/TemplateTest';
import { readPackageConfigFromDir } from '@goldstack/utils-package';

import assert from 'assert';
import axios from 'axios';
import { retryOperation } from './Utils';

export const assertEndpointAvaialble = async (url: string): Promise<void> => {
  const resp = await axios.get(url);
  assert(
    resp.status === 200 || resp.status === 304 || resp.status === 201,
    `HTTP call to API resulted in non success response code: ${resp.status} ${resp.statusText} (${url})`
  );
  console.log(
    `Received result from API '${JSON.stringify(resp.data, null, 2)}'`
  );
  // assert(
  //   resp.data === 'success',
  //   `API returned unexpected data: '${resp.data}'`
  // );
};

export class AssertApplicationTest implements TemplateTest {
  getName(): string {
    return 'assert-application';
  }
  async runTest(params: RunTestParams): Promise<void> {
    const packageConfig = readPackageConfigFromDir(params.packageDir);

    for (const deployment of packageConfig.deployments) {
      const applicationUrl = 'https://' + deployment.configuration.domain + '/';
      console.log(
        'Asserting application deployed for',
        deployment.name,
        'deployed to',
        applicationUrl
      );
      // in case there are delays with DNS resolution
      await retryOperation(
        async () => {
          await assertEndpointAvaialble(applicationUrl);
        },
        10000,
        6 * 15 // 15 min
      );
    }
  }
}
