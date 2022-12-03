import {
  getMockedUserAccessToken,
  getMockedUserIdToken,
  parseToken,
  setMockedUserAccessToken,
  setMockedUserIdToken,
} from './userManagementClientMock';
import {
  getMockedAccessTokenProperties,
  getMockedIdTokenProperties,
} from './userManagementMock';

test('Should generate client-side tokens', () => {
  setMockedUserAccessToken({
    username: '024651bd-6c2d-4890-a15b-51fe281516b7',
  });
  const accessToken = getMockedUserAccessToken();
  const accessTokenData = parseToken(accessToken);
  expect(accessTokenData.username).toEqual(
    '024651bd-6c2d-4890-a15b-51fe281516b7'
  );
  expect(accessTokenData.client_id).toEqual(
    getMockedAccessTokenProperties().client_id
  );

  setMockedUserIdToken({
    email: 'frontend@email.com',
  });
  const idToken = getMockedUserIdToken();
  const idTokenData = parseToken(idToken);
  expect(idTokenData.email).toEqual('frontend@email.com');
  expect(idTokenData.token_use).toEqual(getMockedIdTokenProperties().token_use);
});
