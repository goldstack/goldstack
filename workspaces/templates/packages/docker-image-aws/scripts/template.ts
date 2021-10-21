import { run } from '@goldstack/template-docker-image-aws';

run(process.argv).catch((e) => {
  console.log(e);
  process.exit(1);
});
