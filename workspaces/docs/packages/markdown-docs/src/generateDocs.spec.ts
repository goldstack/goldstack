import { generateDocs } from './generateDocs';

import { mkdir } from '@goldstack/utils-sh';

const getDocsDir = (): string => {
  return './../../docs/';
};

describe('Generate docs', () => {
  it('Should generate documentation', async () => {
    mkdir('-p', 'localTests/');
    const res = await generateDocs({
      source: getDocsDir(),
      destination: 'localTests/',
    });
    console.log(JSON.stringify(res, null, 2));
  });
});
