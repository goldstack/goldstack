import { TemplateTest, RunTestParams } from './../types/TemplateTest';
import { readPackageConfigFromDir } from '@goldstack/utils-package';

import assert from 'assert';
import axios from 'axios';

export const assertEndpointAvaialble = async (url: string): Promise<void> => {
  const resp = await axios.get(url);
  assert(
    resp.status === 200 || resp.status === 304,
    `HTTP call to API resulted in non success reponse code: ${resp.status} ${resp.statusText} (${url})`
  );
  console.log(`Received result from API '${resp.data}'`);
  assert(
    resp.data === 'success',
    `API returned unexpected data: '${resp.data}'`
  );
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const retryOperation = (
  operation: () => Promise<any>,
  delay: number,
  retries: number
) =>
  new Promise((resolve, reject) => {
    return operation()
      .then(resolve)
      .catch((reason) => {
        if (retries > 0) {
          return wait(delay)
            .then(retryOperation.bind(null, operation, delay, retries - 1))
            .then(resolve)
            .catch(reject);
        }
        return reject(reason);
      });
  });
export class RestApiTest implements TemplateTest {
  getName(): string {
    return 'assert-rest-api';
  }
  async runTest(params: RunTestParams): Promise<void> {
    const packageConfig = readPackageConfigFromDir(params.packageDir);

    for (const deployment of packageConfig.deployments) {
      const apiUrl = 'https://' + deployment.configuration.apiDomain + '/';
      console.log(
        'Asserting API deployed for',
        deployment.name,
        'deployed to',
        apiUrl
      );
      // in case there are delays with DNS resolution
      await retryOperation(
        async () => {
          await assertEndpointAvaialble(apiUrl);
        },
        10000,
        6 * 10 // 10 min
      );
    }
  }
}
