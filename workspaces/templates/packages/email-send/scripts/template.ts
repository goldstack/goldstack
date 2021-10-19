import { run } from '@goldstack/template-email-send';

run(process.argv).catch((e) => {
  console.log(e);
  process.exit(1);
});
