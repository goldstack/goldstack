/* esbuild-ignore server */

import {
  CognitoAccessTokenPayload,
  CognitoIdTokenPayload,
} from 'aws-jwt-verify/jwt-model';
import {
  getMockedAccessTokenProperties,
  getMockedIdTokenProperties,
} from './userManagementMock';

let mockedUserAccessToken: string | undefined = undefined;
let mockedUserIdToken: string | undefined = undefined;

export function setMockedUserAccessToken(
  propertiesOrToken: CognitoAccessTokenPayload | object | string | undefined
) {
  if (!propertiesOrToken) {
    mockedUserAccessToken = undefined;
    return;
  }
  if (typeof propertiesOrToken === 'string') {
    mockedUserAccessToken = propertiesOrToken;
  }
  if (!(typeof propertiesOrToken === 'object')) {
    throw new Error(
      'Properties for access token must be an object if not string token provided.'
    );
  }
  mockedUserAccessToken = generateToken({
    ...getMockedAccessTokenProperties(),
    ...propertiesOrToken,
  });
}

export function setMockedUserIdToken(
  propertiesOrToken: CognitoIdTokenPayload | object | string | undefined
) {
  if (!propertiesOrToken) {
    mockedUserIdToken = undefined;
    return;
  }
  if (typeof propertiesOrToken === 'string') {
    mockedUserIdToken = propertiesOrToken;
  }
  if (!(typeof propertiesOrToken === 'object')) {
    throw new Error(
      'Properties for id token must be an object if not string token provided.'
    );
  }
  mockedUserIdToken = generateToken({
    ...getMockedIdTokenProperties(),
    ...propertiesOrToken,
  });
}

function encodeBase64(str: string) {
  return btoa(str);
}

function stringify(obj: unknown) {
  return JSON.stringify(obj);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function checkSumGen(head: string, body: string): string {
  return 'vCooWRquc3jzGtERLzDmO1JIjdXSwTVKHbA1T34VR0w';
}

function generateToken(properties: unknown): string {
  let result = '';
  const alg = { alg: 'HS256', typ: 'JWT' };
  const header = encodeBase64(stringify(alg));
  result += header + '.';
  const body = encodeBase64(stringify(properties));
  result += body + '.';
  const checkSum = checkSumGen(header, body);
  result += checkSum;
  return result;
}

export function getMockedUserAccessToken() {
  return mockedUserAccessToken;
}

export function getMockedUserIdToken() {
  return mockedUserIdToken;
}

export function parseToken(token: string) {
  return JSON.parse(atob(token.split('.')[1]));
}

setMockedUserAccessToken({});
setMockedUserIdToken({});
