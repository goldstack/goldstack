/* eslint-disable @typescript-eslint/no-unused-vars */
/* esbuild-ignore ui */

import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { SimpleJwksCache } from 'aws-jwt-verify/jwk';

import type { CognitoAccessTokenPayload, CognitoIdTokenPayload } from 'aws-jwt-verify/jwt-model';

import { getDeploymentName, getDeploymentsOutput } from './userManagementConfig';

import { getLocalUserManager, LocalUserManagerImpl } from './userManagementServerMock';

export interface CognitoManager {
  validate(accessToken: string): Promise<CognitoAccessTokenPayload>;
  /**
   * Validates an id token without validating it. On the server, ensure to validate the <i>accessToken</i> as well.
   * It is not recommended practice to assert authentication for an API using an id token only.
   */
  validateIdToken(
    idToken: string,
  ): Promise<CognitoIdTokenPayload & { email: string; 'custom:app_user_id': string }>;
}

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
  return new CognitoManagerImpl(accessTokenVerifier, idTokenVerifier);
}

export class CognitoManagerImpl implements CognitoManager {
  accessTokenVerifier: CognitoJwtVerifier<any, any, any>;
  idTokenVerifier: CognitoJwtVerifier<any, any, any>;

  constructor(
    accessTokenVerifier: CognitoJwtVerifier<any, any, any>,
    idTokenVerifier: CognitoJwtVerifier<any, any, any>,
  ) {
    this.accessTokenVerifier = accessTokenVerifier;
    this.idTokenVerifier = idTokenVerifier;
  }

  async validate(jwtToken: string): Promise<CognitoAccessTokenPayload> {
    try {
      const payload = await this.accessTokenVerifier.verify(jwtToken);
      return payload as any;
    } catch {
      throw new Error('Invalid token');
    }
  }

  async validateIdToken(
    jwtToken: string,
  ): Promise<CognitoIdTokenPayload & { email: string; 'custom:app_user_id': string }> {
    try {
      const payload = await this.idTokenVerifier.verify(jwtToken);
      return payload as any;
    } catch {
      throw new Error('Invalid token');
    }
  }
}
