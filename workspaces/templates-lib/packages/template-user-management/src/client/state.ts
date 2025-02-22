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
