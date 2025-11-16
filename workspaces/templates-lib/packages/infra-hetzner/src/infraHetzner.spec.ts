import { mkdir, write } from '@goldstack/utils-sh';
import assert from 'assert';
import { getHetznerUser } from './infraHetzner';

describe('Hetzner User config', () => {
  it('Should load credentials using a credentials source defined in the credentials file', async () => {
    const testDir = './goldstackLocal/tests/getHetznerUser';

    const hetznerConfig = `{
  "users": [
    {
      "name": "process",
      "config": {
        "token": "dummy"
      }
    }
  ]
}`;

    mkdir('-p', testDir);
    write(hetznerConfig, testDir + '/config.json');

    const providerProcess = await getHetznerUser('process', testDir + '/config.json');
    assert(providerProcess);
  });
});
