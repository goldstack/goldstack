import { getCodeVerifier } from './getCodeVerifier';
import type { GetTokenResults } from './getToken';

export interface ExecuteTokenError {
  error: string;
  errorDescription: string;
}

export async function executeTokenRequest(args: {
  tokenEndpoint: string;
  clientId: string;
  code?: string;
  refreshToken?: string;
  redirectUri: string;
}): Promise<GetTokenResults | ExecuteTokenError> {
  const codeVerifier = await getCodeVerifier();

  const body = new URLSearchParams({
    client_id: args.clientId,
    code_verifier: args.code ? codeVerifier : '',
    grant_type: args.code ? 'authorization_code' : 'refresh_token',
    redirect_uri: args.redirectUri,
    refresh_token: args.refreshToken || '',
    code: args.code || '',
    scope: 'openid email profile',
  });

  const response = await fetch(args.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  let data;
  try {
    data = await response.json();
  } catch (e) {
    return {
      error: `HTTP ${response.status}`,
      errorDescription: 'Received non-JSON response from server',
    };
  }

  if (response.ok) {
    return {
      accessToken: data.access_token,
      refreshToken: args.refreshToken || data.refresh_token,
      idToken: data.id_token,
    };
  } else {
    return {
      error: data.error || `HTTP ${response.status}`,
      errorDescription: data.error_description || 'Unknown error',
    };
  }
}
