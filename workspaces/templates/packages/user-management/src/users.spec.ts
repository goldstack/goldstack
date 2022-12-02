import { connectWithCognito, getEndpoint } from './users';

it('Should validate tokens', async () => {
  const cognito = await connectWithCognito();
  const token = await cognito.validate('somedummytoken');
  console.log(token);
});

it('Generate endpoints', async () => {
  const endpoint = await getEndpoint('authorize', 'prod');
  console.log(endpoint);
});
