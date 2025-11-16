import { getDeploymentName } from '../userManagementConfig';
import { getEndpoint } from './getEndpoints';

import { setForceLogout, setRefreshTokenStorage } from './state';

function eraseCookie(name: string) {
  document.cookie = name + '=; Max-Age=0; SameSite=Strict';
}

/**
 * Will clear all cached variables and redirect user to the sign in page
 */
export async function performLogout(args: {
  goldstackConfig: any;
  packageSchema: any;
  deploymentsOutput: any;
  deploymentName?: string;
}) {
  if (typeof window === 'undefined') {
    return;
  }

  const wasLoggedIn = window.sessionStorage.getItem('goldstack_access_token');

  setRefreshTokenStorage(undefined);
  eraseCookie('goldstack_access_token');
  eraseCookie('goldstack_id_token');
  window.sessionStorage.removeItem('goldstack_access_token');
  window.sessionStorage.removeItem('goldstack_id_token');
  setForceLogout(true);
  const deploymentName = getDeploymentName(args.deploymentName);
  if (deploymentName === 'local') {
    if (wasLoggedIn) {
      window.location.reload();
    }
    return;
  }

  const endpoint = await getEndpoint({ ...args, endpoint: 'logout' });
  window.location.href = endpoint;
}
