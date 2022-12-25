/* esbuild-ignore ui */
import crypto from 'crypto';

import {
  CognitoAccessTokenPayload,
  CognitoIdTokenPayload,
} from 'aws-jwt-verify/jwt-model';
import { CognitoManager } from './cognitoTokenVerify';
import {
  getMockedAccessTokenProperties,
  getMockedIdTokenProperties,
} from './userManagementMock';

let localCognitoManager: CognitoManager | undefined;

export function getLocalUserManager(): CognitoManager {
  if (localCognitoManager) {
    return localCognitoManager;
  }
  localCognitoManager = new LocalUserManagerImpl();
  return localCognitoManager;
}

export function setLocalUserManager(userManager: CognitoManager) {
  localCognitoManager = userManager;
}

function encodeBase64(str: string) {
  return Buffer.from(str).toString('base64');
}

function stringify(obj: unknown) {
  return JSON.stringify(obj);
}

function checkSumGen(head: string, body: string): string {
  const checkSumStr = head + '.' + body;
  const hash = crypto.createHmac('sha256', 'dummy-key-for-local-testing');
  const checkSum = hash.update(checkSumStr).digest('base64');
  return checkSum;
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

export function generateTestIdToken(
  properties: CognitoIdTokenPayload | object
): string {
  const data = {
    ...getMockedIdTokenProperties(),
    ...properties,
  };
  return generateToken(data);
}

export function generateTestAccessToken(
  properties: CognitoAccessTokenPayload | object
): string {
  const data = {
    ...getMockedAccessTokenProperties(),
    ...properties,
  };
  return generateToken(data);
}

function assertNotInProd() {
  if (process.env.LAMBDA_TASK_ROOT) {
    console.warn(
      'JWT token validated using mock validator. ' +
        'This validator does not verify if the token is verified correctly.'
    );
  }
}

export class LocalUserManagerImpl implements CognitoManager {
  async validateIdToken(
    idToken: string
  ): Promise<CognitoIdTokenPayload & { email: string }> {
    assertNotInProd();
    return JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
  }

  async validate(jwtToken: string): Promise<CognitoAccessTokenPayload> {
    assertNotInProd();
    return JSON.parse(Buffer.from(jwtToken.split('.')[1], 'base64').toString());
  }
}
