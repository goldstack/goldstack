/* eslint-disable @typescript-eslint/no-unused-vars */
/* esbuild-ignore ui */

import { CognitoJwtVerifier } from 'aws-jwt-verify';
import type { CognitoAccessTokenPayload } from 'aws-jwt-verify/jwt-model';

import {
  getDeploymentName,
  getDeploymentsOutput,
} from './userManagementConfig';

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
  const verifier = CognitoJwtVerifier.create({
    userPoolId: deploymentOutput.user_pool_id,
    tokenUse: 'access',
    clientId: deploymentOutput.user_pool_client_id,
  });
  return new CognitoManagerImpl(verifier);
}

export interface CognitoManager {
  validate(jwtToken: string): Promise<CognitoAccessTokenPayload>;
}

export class CognitoManagerImpl implements CognitoManager {
  verifier: CognitoJwtVerifier<any, any, any>;

  constructor(verifier: CognitoJwtVerifier<any, any, any>) {
    this.verifier = verifier;
  }

  async validate(jwtToken: string): Promise<CognitoAccessTokenPayload> {
    try {
      const payload = await this.verifier.verify(jwtToken);
      return payload as any;
    } catch {
      throw new Error('Invalid token');
    }
  }
}

export class LocalUserManagerImpl implements CognitoManager {
  async validate(jwtToken: string): Promise<CognitoAccessTokenPayload> {
    return {
      auth_time: Math.floor(Date.now() / 1000),
      client_id: 'local',
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      iat: Math.floor(Date.now() / 1000),
      iss: 'https://localhost/',
      jti: '53b68584-3a9e-4b97-b7de-10924c57d191',
      origin_jti: '4ee806c2-6948-4d57-886b-1e94eb0f5193',
      scope: '',
      sub: '',
      username: '',
      token_use: 'access',
      version: 0,
    };
  }
}
