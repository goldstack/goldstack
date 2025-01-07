import {
  connectWithCognito,
  generateTestAccessToken,
  generateTestIdToken,
  getEndpoint,
  getCookieSettings,
} from './users';

it('Should validate tokens', async () => {
  const cognito = await connectWithCognito();
  const accessToken = generateTestAccessToken({
    username: '37ba5b3e-2e76-4c45-baa3-e7b21101f40d',
  });
  const accessTokenData = await cognito.validate(accessToken);
  expect(accessTokenData.username).toEqual(
    '37ba5b3e-2e76-4c45-baa3-e7b21101f40d'
  );
  expect(accessTokenData.token_use).toEqual('access');

  const idToken = generateTestIdToken({ email: 'testUser@email.com' });
  const idTokenData = await cognito.validateIdToken(idToken);
  expect(idTokenData.email).toEqual('testUser@email.com');
  expect(idTokenData.token_use).toEqual('id');
});

it('Generate endpoints', async () => {
  const endpoint = await getEndpoint('authorize', 'prod');
  expect(endpoint).toContain('oauth2/authorize');
  expect(endpoint).toContain('client_id');
  expect(endpoint).toContain('redirect_uri');
});

it('Should get local cookie settings', () => {
  const cookieSettings = getCookieSettings();
  expect(cookieSettings.cookieDomain).toBe('localhost');
  expect(cookieSettings.cookieSameSite).toBe('None');
});

it('Should get prod cookie settings', () => {
  const cookieSettings = getCookieSettings('prod');
  expect(cookieSettings.cookieDomain).toBe('.dev.goldstack.party');
  expect(cookieSettings.cookieSameSite).toBe('None');
});
