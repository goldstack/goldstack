// based on https://github.com/curityio/pkce-javascript-example/blob/master/index.html
import { excludeInBundle } from '@goldstack/utils-esbuild';

function generateRandomString(length: number) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

async function generateCodeChallenge(randomString: string) {
  let digest: string;

  // make this work both in the browser and Node.js (for unit tests)
  // see https://remarkablemark.medium.com/how-to-generate-a-sha-256-hash-with-javascript-d3b2696382fd
  if (typeof window !== 'undefined') {
    digest = String.fromCharCode(
      ...new Uint8Array(
        await crypto.subtle.digest('SHA-256', new TextEncoder().encode(randomString)),
      ),
    );
    return btoa(digest).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  } else {
    

    const { createHash } = require(excludeInBundle('crypto'));
    digest = createHash('sha256').update(randomString).digest('hex');
    return Buffer.from(digest, 'utf8')
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }
}

let codeVerifier: undefined | string;

export async function getCodeChallenge() {
  return await generateCodeChallenge(await getCodeVerifier());
}

export async function getCodeVerifier() {
  if (codeVerifier) {
    return codeVerifier;
  }

  if (typeof window !== 'undefined' && window.sessionStorage) {
    const inSessionStorage = window.sessionStorage.getItem('goldstack_code_verifier');
    if (inSessionStorage) {
      codeVerifier = inSessionStorage;
      return codeVerifier;
    }
  }

  const newCodeVerifier = generateRandomString(64);
  codeVerifier = newCodeVerifier;

  if (typeof window !== 'undefined' && window.sessionStorage) {
    window.sessionStorage.setItem('goldstack_code_verifier', codeVerifier);
  }
  return codeVerifier;
}
