import {
  generateTestIdToken,
  getLocalUserManager,
} from './userManagementServerMock';

test('Should generate valid test tokens', async () => {
  const cognitoManager = getLocalUserManager();

  const idToken = generateTestIdToken({ email: 'myUser@email.com' });
  const idTokenData = await cognitoManager.validateIdToken(idToken);
  expect(idTokenData.email).toEqual('myUser@email.com');

  const accessToken = generateTestIdToken({
    username: '99918936-07ce-4c17-8ed9-278fdd35406a',
  });
  const accessTokenData = await cognitoManager.validateIdToken(accessToken);
  expect(accessTokenData.username).toEqual(
    '99918936-07ce-4c17-8ed9-278fdd35406a'
  );
});
