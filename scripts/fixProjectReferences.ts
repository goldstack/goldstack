import { run } from '@goldstack/utils-typescript-references';

run(process.argv)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .then(() => {
    // all good
  });
