/**
 * Client-side authentication utilities
 */

export interface ClientAuthResult {
  accessToken: string;
  idToken: string;
}

import { forceLogout } from './state';

/**
 * <p>Obtains the information for a user if a user is logged in.
 * <p>Use <code>performClientAuth</code> to perform a login action.
 */
export function getLoggedInUser(): ClientAuthResult | undefined {
  if (forceLogout) {
    return;
  }

  // if running on the server, such as for rendering a page for SSR, client auth
  // cannot be performed
  if (typeof window === 'undefined') {
    return;
  }
  const existingAccessToken = window.sessionStorage.getItem(
    'goldstack_access_token'
  );
  const existingIdToken = window.sessionStorage.getItem('goldstack_id_token');
  if (existingAccessToken && existingIdToken) {
    return {
      accessToken: existingAccessToken,
      idToken: existingIdToken,
    };
  }
  return;
}

/**
 * <p>Returns true if a user is authenticated
 */
export function isAuthenticated(): boolean {
  return getLoggedInUser() !== undefined;
}
