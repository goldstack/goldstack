import {
  AdminDeleteUserCommand,
  AdminDisableUserCommand,
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import type { CognitoAccessTokenPayload, CognitoIdTokenPayload } from 'aws-jwt-verify/jwt-model';

/**
 * Parameters for deleting a user from the Cognito user pool.
 */
export interface CognitoDeleteUserParams {
  /**
   * The username of the user to delete.
   */
  username?: string;
  /**
   * The email address of the user to delete. Will be used to look up the username if not provided directly.
   */
  email?: string;
}

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
   * @param params - Object containing the username or email of the user to delete
   */
  deleteUser(params: CognitoDeleteUserParams): Promise<void>;
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

  async deleteUser(params: CognitoDeleteUserParams): Promise<void> {
    let resolvedUsername = params.username;

    if (!resolvedUsername) {
      if (!params.email) {
        throw new Error('Either username or email must be provided to delete a user.');
      }

      const listUsersResponse = await this.cognitoClient.send(
        new ListUsersCommand({
          UserPoolId: this.userPoolId,
          Filter: `email = "${params.email}"`,
        }),
      );

      const usersWithUsername = (listUsersResponse.Users || []).filter(
        (u) => typeof u.Username === 'string',
      );

      if (usersWithUsername.length === 0) {
        throw new Error(`No user found with email: ${params.email}`);
      }

      if (usersWithUsername.length > 1) {
        throw new Error(
          `Multiple users found with email: ${params.email}. Please provide a specific username.`,
        );
      }

      resolvedUsername = usersWithUsername[0].Username;
    }

    if (!resolvedUsername) {
      throw new Error('Unable to resolve username for deletion.');
    }

    await this.cognitoClient.send(
      new AdminDisableUserCommand({
        UserPoolId: this.userPoolId,
        Username: resolvedUsername,
      }),
    );
    await this.cognitoClient.send(
      new AdminDeleteUserCommand({
        UserPoolId: this.userPoolId,
        Username: resolvedUsername,
      }),
    );
  }
}
