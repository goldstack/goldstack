import {
  AdminDeleteUserCommand,
  AdminDisableUserCommand,
  CognitoIdentityProviderClient,
  ListUsersCommand,
  type AttributeType,
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import type { CognitoAccessTokenPayload, CognitoIdTokenPayload } from 'aws-jwt-verify/jwt-model';

/**
 * Represents a user retrieved from the Cognito user pool.
 */
export interface CognitoUser {
  id: string;
  username: string;
  email: string;
  attributes: Record<string, string>;
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
   * Retrieves a list of users from the Cognito user pool matching the given email address.
   *
   * @param email - The email address to search for
   * @returns An array of CognitoUser objects
   */
  getUsersByEmail(email: string): Promise<CognitoUser[]>;
  /**
   * Deletes a user from the Cognito user pool. First disables the user, then deletes them.
   *
   * @param username - The username of the user to delete
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

  async getUsersByEmail(email: string): Promise<CognitoUser[]> {
    const allUsers: CognitoUser[] = [];
    let paginationToken: string | undefined = undefined;

    do {
      const listUsersResponse = await this.cognitoClient.send(
        new ListUsersCommand({
          UserPoolId: this.userPoolId,
          Filter: `email = "${email.replace(/"/g, '\\"')}"`,
          PaginationToken: paginationToken,
        }),
      );

      const awsUsers = listUsersResponse.Users || [];

      const mappedUsers = awsUsers
        .filter((awsUser) => !!awsUser.Username)
        .map((awsUser) => {
          const attributes: Record<string, string> = {};
          let id = '';
          let userEmail = '';

          if (awsUser.Attributes) {
            awsUser.Attributes.forEach((attr: AttributeType) => {
              if (attr.Name && attr.Value) {
                attributes[attr.Name] = attr.Value;
                if (attr.Name === 'sub') {
                  id = attr.Value;
                } else if (attr.Name === 'email') {
                  userEmail = attr.Value;
                }
              }
            });
          }

          return {
            id,
            username: awsUser.Username || '',
            email: userEmail,
            attributes,
          };
        });

      allUsers.push(...mappedUsers);

      // AWS SDK uses PaginationToken directly
      paginationToken = listUsersResponse.PaginationToken;
    } while (paginationToken);

    return allUsers;
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
