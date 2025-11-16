import { info } from '@goldstack/utils-log';
import { readPackageConfigFromDir } from '@goldstack/utils-package';
import assert from 'assert';
import axios from 'axios';
import type { RunTestParams, TemplateTest } from '../types/TemplateTest';

export const assertWebsiteAvailable = async (url: string): Promise<void> => {
  const resp = await axios.get(url);
  assert(
    resp.status === 200 || resp.status === 304,
    `HTTP call to website resulted in non success reponse code: ${resp.status} ${resp.statusText} (${url})`,
  );
};

export const assertWebsiteRedirect = async (
  url: string,
  expectedForwardUrl: string,
): Promise<void> => {
  const resp = await axios.get(url);
  if (resp.status === 200 || resp.status === 304) {
    assert(
      resp.request.res.responseUrl === expectedForwardUrl,
      `Forwarded to unepxected URL ${resp.request.res.responseUrl}. Expected: ${expectedForwardUrl}`,
    );
    return;
  }
  assert(
    resp.status === 301,
    `HTTP call to website resulted in no redirect reponse code: ${resp.status} ${resp.statusText} (${url})`,
  );
  assert(
    resp.headers.Location === expectedForwardUrl,
    `Unexpected forward URL: ${resp.headers.Location}. Expected: ${expectedForwardUrl}`,
  );
};

export class AssertStaticWebsiteAwsDeploymentsTest implements TemplateTest {
  getName(): string {
    return 'assert-static-website-aws-deployments';
  }
  async runTest(params: RunTestParams): Promise<void> {
    const packageConfig = readPackageConfigFromDir(params.packageDir);

    for (const deployment of packageConfig.deployments) {
      info(
        'Asserting website deployed for ' +
          deployment.name +
          ' deployed to ' +
          deployment.configuration.websiteDomain,
      );

      const staticWebsite1Url = 'https://' + deployment.configuration.websiteDomain + '/';
      await assertWebsiteAvailable(staticWebsite1Url);
      await assertWebsiteRedirect(
        'http://' + deployment.configuration.websiteDomain,
        staticWebsite1Url,
      );
      await assertWebsiteRedirect(
        'https://' + deployment.configuration.websiteDomainRedirect,
        staticWebsite1Url,
      );
      await assertWebsiteRedirect(
        'http://' + deployment.configuration.websiteDomainRedirect,
        staticWebsite1Url,
      );
    }
  }
}
