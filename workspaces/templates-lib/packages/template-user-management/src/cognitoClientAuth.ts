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

export async function getToken(args: {
  goldstackConfig: any;
  code: string;
  packageSchema: any;
  deploymentsOutput: any;
  deploymentName?: string;
}): Promise<string> {
  const deploymentName = getDeploymentName(args.deploymentName);

  if (deploymentName === 'local') {
    return 'https://localhost';
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
    redirectUri: deployment.configuration.callbackUrl,
  });
}

export async function executeTokenRequest(args: {
  tokenEndpoint: string;
  clientId: string;
  code: string;
  redirectUri: string;
}) {
  const xhr = new XMLHttpRequest();

  return new Promise<string>(async (resolve, reject) => {
    xhr.onload = function () {
      const response = xhr.response;
      if (xhr.status == 200) {
        resolve(response.access_token);
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
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
        redirect_uri: args.redirectUri,
        code: args.code,
      })
    );
  });
}
