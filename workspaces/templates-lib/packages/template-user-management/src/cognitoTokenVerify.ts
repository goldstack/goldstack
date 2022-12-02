/* eslint-disable @typescript-eslint/no-unused-vars */
/* esbuild-ignore ui */

import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { SimpleJwksCache } from 'aws-jwt-verify/jwk';

import type {
  CognitoAccessTokenPayload,
  CognitoIdTokenPayload,
} from 'aws-jwt-verify/jwt-model';

import {
  getDeploymentName,
  getDeploymentsOutput,
} from './userManagementConfig';

/**
 * We want to keep only one JWKS cache globally for our application.
 */
let sharedJwksCache: SimpleJwksCache | undefined = undefined;

export async function connectWithCognito({
  goldstackConfig,
  packageSchema,
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
    return new LocalUserManagerImpl();
  }

  const deploymentOutput = getDeploymentsOutput(
    deploymentsOutput,
    deploymentName
  );

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
    }
  );
  const idTokenVerifier = CognitoJwtVerifier.create(
    {
      userPoolId: deploymentOutput.terraform.user_pool_id.value,
      tokenUse: 'id',
      clientId: deploymentOutput.terraform.user_pool_client_id.value,
    },
    {
      jwksCache: sharedJwksCache,
    }
  );
  return new CognitoManagerImpl(accessTokenVerifier, idTokenVerifier);
}

export interface CognitoManager {
  validate(accessToken: string): Promise<CognitoAccessTokenPayload>;
  /**
   * Validates an id token without validating it. On the server, ensure to validate the <i>accessToken</i> as well.
   * It is not recommended practice to assert authentication for an API using an id token only.
   */
  validateIdToken(
    idToken: string
  ): Promise<CognitoIdTokenPayload & { email: string }>;
}

export class CognitoManagerImpl implements CognitoManager {
  accessTokenVerifier: CognitoJwtVerifier<any, any, any>;
  idTokenVerifier: CognitoJwtVerifier<any, any, any>;

  constructor(
    accessTokenVerifier: CognitoJwtVerifier<any, any, any>,
    idTokenVerifier: CognitoJwtVerifier<any, any, any>
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
    jwtToken: string
  ): Promise<CognitoIdTokenPayload & { email: string }> {
    try {
      const payload = await this.idTokenVerifier.verify(jwtToken);
      return payload as any;
    } catch {
      throw new Error('Invalid token');
    }
  }
}

export class LocalUserManagerImpl implements CognitoManager {
  async validateIdToken(
    idToken: string
  ): Promise<CognitoIdTokenPayload & { email: string }> {
    return {
      at_hash: 'NixgfrD9129y_3vcIILTIg',
      sub: '9ad18936-07ce-4c17-8ed9-278fdd35406a',
      email_verified: true,
      phone_number_verified: false,
      'cognito:preferred_role': '',
      'cognito:roles': [],
      identities: [],
      iss: 'https://cognito-idp.us-west-2.amazonaws.com/us-west-2_AnBhna7ph',
      'cognito:username': '9ad18936-07ce-4c17-8ed9-278fdd35406a',
      origin_jti: '72408fc1-2223-4a04-9a45-f10aaefd77ee',
      aud: '7cuiqmug2c50sgqi93igjk16mf',
      event_id: '4dcbf59b-53a8-4674-94c9-81eb2171b66d',
      token_use: 'id',
      auth_time: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      iat: Math.floor(Date.now() / 1000),
      jti: '17fdf966-9882-4114-8095-ecc9ac19aa7b',
      email: 'dummy@dummy.com',
    };
  }
  async validate(jwtToken: string): Promise<CognitoAccessTokenPayload> {
    return {
      auth_time: Math.floor(Date.now() / 1000),
      client_id: '7cuiqmug2c50sgqi93igjk16mf',
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      iat: Math.floor(Date.now() / 1000),
      iss: 'https://cognito-idp.us-west-2.amazonaws.com/us-west-2_AnBhna7ph',
      jti: '53b68584-3a9e-4b97-b7de-10924c57d191',
      origin_jti: '4ee806c2-6948-4d57-886b-1e94eb0f5193',
      scope: 'openid email',
      sub: '9ad18936-07ce-4c17-8ed9-278fdd35406a',
      username: '9ad18936-07ce-4c17-8ed9-278fdd35406a',
      token_use: 'access',
      version: 2,
    };
  }
}
