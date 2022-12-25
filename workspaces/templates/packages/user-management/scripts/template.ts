import { run } from '@goldstack/template-user-management-cli';

run(process.argv).catch((e) => {
  console.log(e);
  process.exit(1);
});
