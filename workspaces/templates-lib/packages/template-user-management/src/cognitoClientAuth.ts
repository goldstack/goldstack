import { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';
import { getCodeVerifier } from './codeChallenge';
import { getEndpoint } from './cognitoEndpoints';
import {
  UserManagementDeployment,
  UserManagementPackage,
} from './templateUserManagement';
import {
  getDeploymentName,
  getDeploymentsOutput,
} from './userManagementConfig';

export interface GetTokenResults {
  accessToken: string;
  refreshToken: string;
}

export async function getToken(args: {
  goldstackConfig: any;
  code?: string;
  refreshToken?: string;
  packageSchema: any;
  deploymentsOutput: any;
  deploymentName?: string;
}): Promise<GetTokenResults> {
  const deploymentName = getDeploymentName(args.deploymentName);

  if (deploymentName === 'local') {
    if (args.code !== 'dummy-client-token') {
      throw new Error(
        `Unexpected code for client auth: '${args.code}'. Expected: dummy-client-token`
      );
    }
    return {
      accessToken: 'dummyToken',
      refreshToken: 'dummyRefreshToken',
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

export async function executeTokenRequest(args: {
  tokenEndpoint: string;
  clientId: string;
  code?: string;
  refreshToken?: string;
  redirectUri: string;
}): Promise<GetTokenResults> {
  const xhr = new XMLHttpRequest();

  return new Promise<GetTokenResults>(async (resolve, reject) => {
    xhr.onload = function () {
      const response = xhr.response;
      if (xhr.status == 200) {
        resolve({
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
        });
      } else {
        reject(
          new Error(
            `Cannot obtain token ${response.error_description} (${response.error})`
          )
        );
      }
    };
    xhr.responseType = 'json';
    xhr.open('POST', args.tokenEndpoint, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    const codeVerifier = await getCodeVerifier();
    xhr.send(
      new URLSearchParams({
        client_id: args.clientId,
        code_verifier: args.code ? codeVerifier : '',
        grant_type: args.code ? 'authorization_code' : 'refresh_token',
        redirect_uri: args.redirectUri,
        refresh_token: args.refreshToken || '',
        code: args.code || '',
      })
    );
  });
}
