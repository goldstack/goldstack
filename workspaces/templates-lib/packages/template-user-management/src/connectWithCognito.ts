/* eslint-disable @typescript-eslint/no-unused-vars */
/* esbuild-ignore ui */

import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { SimpleJwksCache } from 'aws-jwt-verify/jwk';
import { CognitoManager, CognitoManagerImpl } from './CognitoManager';
import { getDeploymentName, getDeploymentsOutput } from './userManagementConfig';
import { getLocalUserManager } from './userManagementServerMock';

export { CognitoManager } from './CognitoManager';

/**
 * We want to keep only one JWKS cache globally for our application.
 */
let sharedJwksCache: SimpleJwksCache | undefined;

export async function connectWithCognito({
  goldstackConfig: _goldstackConfig,
  packageSchema: _packageSchema,
  deploymentsOutput,
  deploymentName,
}: {
  goldstackConfig: any;
  packageSchema: any;
  deploymentsOutput: any;
  deploymentName?: string;
}): Promise<CognitoManager> {
  deploymentName = getDeploymentName(deploymentName);

  if (deploymentName === 'local') {
    return getLocalUserManager();
  }

  const deploymentOutput = getDeploymentsOutput(deploymentsOutput, deploymentName);

  if (!sharedJwksCache) {
    sharedJwksCache = new SimpleJwksCache();
  }

  const accessTokenVerifier = CognitoJwtVerifier.create(
    {
      userPoolId: deploymentOutput.terraform.user_pool_id.value,
      tokenUse: 'access',
      clientId: deploymentOutput.terraform.user_pool_client_id.value,
    },
    {
      jwksCache: sharedJwksCache,
    },
  );
  const idTokenVerifier = CognitoJwtVerifier.create(
    {
      userPoolId: deploymentOutput.terraform.user_pool_id.value,
      tokenUse: 'id',
      clientId: deploymentOutput.terraform.user_pool_client_id.value,
    },
    {
      jwksCache: sharedJwksCache,
    },
  );
  return new CognitoManagerImpl(
    accessTokenVerifier,
    idTokenVerifier,
    deploymentOutput.terraform.user_pool_id.value,
  );
}
