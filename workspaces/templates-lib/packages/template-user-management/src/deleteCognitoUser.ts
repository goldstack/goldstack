/* esbuild-ignore ui */

import type { CognitoManager } from './connectWithCognito';

export interface DeleteCognitoUserParams {
  /**
   * An authenticated CognitoManager instance, obtained from connectWithCognito()
   */
  cognitoManager: CognitoManager;
  /**
   * The username of the user to delete
   */
  username?: string;
  /**
   * The email address of the user to delete (used if username is not provided)
   */
  email?: string;
}

/**
 * Deletes a user from the Cognito user pool. First disables the user, then deletes them.
 *
 * @param params - Object containing the CognitoManager and username or email
 */
export async function deleteCognitoUser(params: DeleteCognitoUserParams): Promise<void> {
  await params.cognitoManager.deleteUser({
    username: params.username,
    email: params.email,
  });
}
