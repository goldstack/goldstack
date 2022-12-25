import assert from 'assert';
import { getCodeChallenge } from './codeChallenge';

it('Should generate code challenge', async () => {
  const challenge = await getCodeChallenge();
  assert(challenge.length > 10);
});
