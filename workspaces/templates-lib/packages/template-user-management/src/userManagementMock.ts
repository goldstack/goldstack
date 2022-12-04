export function getMockedIdTokenProperties() {
  return {
    at_hash: 'NixgfrD9129y_3vcIILTIg',
    sub: '9ad18936-07ce-4c17-8ed9-278fdd35406a',
    email_verified: true,
    phone_number_verified: false,
    'cognito:preferred_role': '',
    'cognito:roles': [],
    identities: [],
    iss: 'https://cognito-idp.us-west-2.amazonaws.com/us-west-2_AnBhna7ph',
    'cognito:username': '9ad18936-07ce-4c17-8ed9-278fdd35406a',
    origin_jti: '72408fc1-2223-4a04-9a45-f10aaefd77ee',
    aud: '7cuiqmug2c50sgqi93igjk16mf',
    event_id: '4dcbf59b-53a8-4674-94c9-81eb2171b66d',
    token_use: 'id',
    auth_time: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    iat: Math.floor(Date.now() / 1000),
    jti: '17fdf966-9882-4114-8095-ecc9ac19aa7b',
    email: 'dummy@dummy.com',
  };
}

export function getMockedAccessTokenProperties() {
  return {
    auth_time: Math.floor(Date.now() / 1000),
    client_id: '7cuiqmug2c50sgqi93igjk16mf',
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    iat: Math.floor(Date.now() / 1000),
    iss: 'https://cognito-idp.us-west-2.amazonaws.com/us-west-2_AnBhna7ph',
    jti: '53b68584-3a9e-4b97-b7de-10924c57d191',
    origin_jti: '4ee806c2-6948-4d57-886b-1e94eb0f5193',
    scope: 'openid email',
    sub: '9ad18936-07ce-4c17-8ed9-278fdd35406a',
    username: '9ad18936-07ce-4c17-8ed9-278fdd35406a',
    token_use: 'access',
    version: 2,
  };
}
