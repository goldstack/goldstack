import { run } from '@goldstack/template-hetzner-vps-cli';

run(process.argv).catch((e) => {
  console.log(e);
  process.exit(1);
});
