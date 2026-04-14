import type { CognitoManager, CognitoUser } from './CognitoManager';

export interface GetCognitoUsersByEmailParams {
  /**
   * An authenticated CognitoManager instance, obtained from connectWithCognito()
   */
  cognitoManager: CognitoManager;
  /**
   * The email address to search for
   */
  email: string;
}

/**
 * Retrieves a list of users from the Cognito user pool matching the given email address.
 *
 * @param params - Object containing the CognitoManager and email
 * @returns A promise that resolves to an array of CognitoUser objects
 */
export async function getCognitoUsersByEmail(
  params: GetCognitoUsersByEmailParams,
): Promise<CognitoUser[]> {
  return params.cognitoManager.getUsersByEmail(params.email);
}
