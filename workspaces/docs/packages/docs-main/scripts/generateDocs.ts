import { generateDocs } from '@goldstack/markdown-docs';

generateDocs({
  source: './../../docs/',
  destination: 'src/data/docs/',
})
  .then(() => {
    console.log('Docs generated successfully');
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
