import { run } from '@goldstack/template-nextjs';

run(process.argv).catch((e) => {
  console.log(e);
  process.exit(1);
});
