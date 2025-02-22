import { getDeploymentName } from '../userManagementConfig';
import { getEndpoint } from './getEndpoints';
import { handleRedirectCallback } from './handleRedirectCallback';
import { getMockedUserAccessToken } from '../userManagementClientMock';
import type { ClientAuthResult } from './auth';
import { getAndPersistToken } from './getAndPersistToken';

import {
  forceLogout,
  refreshTokenStorage,
  setRefreshTokenStorage,
} from './state';

/**
 * Performs a redirect operation for authentication
 */
export async function operationWithRedirect(args: {
  goldstackConfig: any;
  packageSchema: any;
  deploymentsOutput: any;
  deploymentName?: string;
  operation: 'authorize' | 'signup';
}): Promise<ClientAuthResult | undefined> {
  if (forceLogout) {
    return;
  }
  const deploymentName = getDeploymentName(args.deploymentName);

  // if running on the server, such as for rendering a page for SSR, client auth
  // cannot be performed
  if (typeof window === 'undefined') {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  // do not redirect in Jest tests
  if (typeof process !== 'undefined' && typeof jest !== 'undefined') {
    const token = await getAndPersistToken({
      ...args,
      code: 'dummy-local-client-code',
    });
    if (!token) {
      return;
    }
    return {
      accessToken: token.accessToken,
      idToken: token.idToken,
    };
  }

  if (code) {
    return await handleRedirectCallback(args);
  }

  if (deploymentName === 'local') {
    if (getMockedUserAccessToken() === undefined) {
      return;
    }
    window.location.href = '?code=dummy-local-client-code';
    return;
  }

  const refreshToken = refreshTokenStorage;
  // if there is a refresh token, try to get a new token with that first before doing a redirect
  if (refreshToken) {
    try {
      const token = await getAndPersistToken({ ...args, refreshToken });
      if (!token) {
        return;
      }
      return {
        accessToken: token.accessToken,
        idToken: token.idToken,
      };
    } catch (e) {
      // if there is an error, we better discard our refresh token, it could be expired
      setRefreshTokenStorage(undefined);
      // then we proceed with the redirect to login
    }
  }

  const endpoint = await getEndpoint({ ...args, endpoint: args.operation });

  window.location.href = endpoint;
  return undefined;
}
