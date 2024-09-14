import { createZip } from '@goldstack/template-hetzner-vps-cli';

createZip()
  .catch((e) => console.log(e))
  .then(() => console.log('VPS files build success'));
