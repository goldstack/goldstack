import { getToken } from './getToken';
import { getCookieSettings } from './getCookieSettings';

import { setRefreshTokenStorage } from './state';

function setCookie(name: string, value: string, minutes: number, domain: string, sameSite: string) {
  let expires: string;
  if (minutes) {
    const date = new Date();
    date.setTime(date.getTime() + minutes * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  } else {
    expires = '';
  }
  document.cookie =
    name + '=' + value + expires + `; path=/; domain=${domain}; SameSite=${sameSite}; Secure`;
}

/**
 * Gets and persists authentication tokens
 */
export async function getAndPersistToken(args: {
  goldstackConfig: any;
  packageSchema: any;
  deploymentsOutput: any;
  deploymentName?: string | undefined;
  code?: string;
  refreshToken?: string;
}) {
  const token = await getToken({ ...args });
  if (!token) {
    return;
  }
  window.sessionStorage.setItem('goldstack_access_token', token.accessToken);
  window.sessionStorage.setItem('goldstack_id_token', token.idToken);
  setRefreshTokenStorage(token.refreshToken);

  const cookieSettings = getCookieSettings({ ...args });
  // only store access and id token in cookie
  const cookieDomain = cookieSettings.cookieDomain;

  const cookieSameSite = cookieSettings.cookieSameSite;
  setCookie('goldstack_access_token', token.accessToken, 60 * 24, cookieDomain, cookieSameSite);
  setCookie('goldstack_id_token', token.idToken, 60 * 24, cookieDomain, cookieSameSite);
  return token;
}
