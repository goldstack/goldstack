/**
 * Shared state variables used across authentication modules
 */

export let forceLogout = false;
export let refreshTokenStorage: string | undefined = undefined;

export function setForceLogout(value: boolean) {
  forceLogout = value;
}

export function setRefreshTokenStorage(token: string | undefined) {
  refreshTokenStorage = token;
}

/**
 * Validates that a state parameter is a safe relative path.
 * Prevents open redirect vulnerabilities by rejecting absolute URLs
 * and protocol-relative URLs.
 *
 * @param state - The state value to validate
 * @returns true if the state is a valid relative path
 */
export function isValidState(state: string): boolean {
  return state.startsWith('/') && !state.startsWith('//') && !state.includes('://');
}
