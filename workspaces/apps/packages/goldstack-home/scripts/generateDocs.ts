import { run } from '@goldstack/utils-docs-cli';

run()
  .then(() => {
    console.log('Docs successfully generated');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
