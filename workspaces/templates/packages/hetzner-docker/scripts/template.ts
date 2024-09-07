import { run } from '@goldstack/template-hetzner-docker-cli';

run(process.argv).catch((e) => {
  console.log(e);
  process.exit(1);
});
