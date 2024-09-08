import { createZip } from '@goldstack/template-hetzner-docker-cli';

createZip()
  .catch((e) => console.log(e))
  .then(() => console.log('VPS files build success'));
