import { run } from '@goldstack/template-backup-cli';

run(process.argv).catch((e) => {
  console.log(e);
  process.exit(1);
});
