/* esbuild-ignore server */

import { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';
import { getEndpoint } from './getEndpoints';
import {
  UserManagementDeployment,
  UserManagementPackage,
} from '../templateUserManagement';
import {
  getMockedUserAccessToken,
  getMockedUserIdToken,
} from '../userManagementClientMock';
import {
  getDeploymentName,
  getDeploymentsOutput,
} from '../userManagementConfig';
import { executeTokenRequest } from './executeTokenRequest';

export interface GetTokenResults {
  accessToken: string;
  refreshToken: string;
  idToken: string;
}

export async function getToken(args: {
  goldstackConfig: any;
  code?: string;
  refreshToken?: string;
  packageSchema: any;
  deploymentsOutput: any;
  deploymentName?: string;
}): Promise<GetTokenResults | undefined> {
  const deploymentName = getDeploymentName(args.deploymentName);

  if (deploymentName === 'local') {
    if (args.code !== 'dummy-local-client-code') {
      throw new Error(
        `Unexpected code for local client auth: '${args.code}'. Expected: dummy-local-client-code`
      );
    }
    const mockedUserAccessToken = getMockedUserAccessToken();
    const mockedIdToken = getMockedUserIdToken();
    if (!mockedUserAccessToken || !mockedIdToken) {
      return;
    }
    return {
      accessToken: mockedUserAccessToken,
      refreshToken: 'dummyRefreshToken',
      idToken: mockedIdToken,
    };
  }

  const packageConfig = new EmbeddedPackageConfig<
    UserManagementPackage,
    UserManagementDeployment
  >({
    goldstackJson: args.goldstackConfig,
    packageSchema: args.packageSchema,
  });

  const deploymentOutput = getDeploymentsOutput(
    args.deploymentsOutput,
    deploymentName
  );

  const deployment = packageConfig.getDeployment(deploymentName);

  return await executeTokenRequest({
    tokenEndpoint: await getEndpoint({ ...args, endpoint: 'token' }),
    clientId: deploymentOutput.terraform.user_pool_client_id.value,
    code: args.code,
    refreshToken: args.refreshToken,
    redirectUri: deployment.configuration.callbackUrl,
  });
}
