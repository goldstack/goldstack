import { mkdir } from '@goldstack/utils-sh';
import { generateDocs } from './generateDocs';

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
    expect(res).toBeDefined();
  });
});
