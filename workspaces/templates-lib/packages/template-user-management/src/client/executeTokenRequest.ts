import { getCodeVerifier } from './getCodeVerifier';
import type { GetTokenResults } from './getToken';

export async function executeTokenRequest(args: {
  tokenEndpoint: string;
  clientId: string;
  code?: string;
  refreshToken?: string;
  redirectUri: string;
}): Promise<GetTokenResults> {
  const xhr = new XMLHttpRequest();

  return new Promise<GetTokenResults>(async (resolve, reject) => {
    xhr.onload = () => {
      const response = xhr.response;
      if (xhr.status === 200) {
        resolve({
          accessToken: response.access_token,
          refreshToken: args.refreshToken || response.refresh_token,
          idToken: response.id_token,
        });
      } else {
        reject(new Error(`Cannot obtain token ${response.error_description} (${response.error})`));
      }
    };
    xhr.responseType = 'json';
    xhr.open('POST', args.tokenEndpoint, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    const codeVerifier = await getCodeVerifier();
    xhr.send(
      new URLSearchParams({
        client_id: args.clientId,
        code_verifier: args.code ? codeVerifier : '',
        grant_type: args.code ? 'authorization_code' : 'refresh_token',
        redirect_uri: args.redirectUri,
        refresh_token: args.refreshToken || '',
        code: args.code || '',
        scope: 'openid email profile',
      }),
    );
  });
}
