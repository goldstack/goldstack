import {
  AdminDeleteUserCommand,
  AdminDisableUserCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import type { CognitoAccessTokenPayload, CognitoIdTokenPayload } from 'aws-jwt-verify/jwt-model';

export interface CognitoManager {
  validate(accessToken: string): Promise<CognitoAccessTokenPayload>;
  /**
   * Validates an id token without validating it. On the server, ensure to validate the <i>accessToken</i> as well.
   * It is not recommended practice to assert authentication for an API using an id token only.
   */
  validateIdToken(
    idToken: string,
  ): Promise<CognitoIdTokenPayload & { email: string; 'custom:app_user_id': string }>;
  /**
   * Deletes a user from the Cognito user pool. First disables the user, then deletes them.
   *
   * @param username - The username (or email) of the user to delete
   */
  deleteUser(username: string): Promise<void>;
}

export class CognitoManagerImpl implements CognitoManager {
  accessTokenVerifier: CognitoJwtVerifier<any, any, any>;
  idTokenVerifier: CognitoJwtVerifier<any, any, any>;
  userPoolId: string;
  cognitoClient: CognitoIdentityProviderClient;

  constructor(
    accessTokenVerifier: CognitoJwtVerifier<any, any, any>,
    idTokenVerifier: CognitoJwtVerifier<any, any, any>,
    userPoolId: string,
  ) {
    this.accessTokenVerifier = accessTokenVerifier;
    this.idTokenVerifier = idTokenVerifier;
    this.userPoolId = userPoolId;
    this.cognitoClient = new CognitoIdentityProviderClient({});
  }

  async validate(jwtToken: string): Promise<CognitoAccessTokenPayload> {
    try {
      const payload = await this.accessTokenVerifier.verify(jwtToken);
      return payload as any;
    } catch (e) {
      throw new Error(`Invalid token: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }

  async validateIdToken(
    jwtToken: string,
  ): Promise<CognitoIdTokenPayload & { email: string; 'custom:app_user_id': string }> {
    try {
      const payload = await this.idTokenVerifier.verify(jwtToken);
      return payload as any;
    } catch (e) {
      throw new Error(`Invalid token: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }

  async deleteUser(username: string): Promise<void> {
    await this.cognitoClient.send(
      new AdminDisableUserCommand({
        UserPoolId: this.userPoolId,
        Username: username,
      }),
    );
    await this.cognitoClient.send(
      new AdminDeleteUserCommand({
        UserPoolId: this.userPoolId,
        Username: username,
      }),
    );
  }
}
