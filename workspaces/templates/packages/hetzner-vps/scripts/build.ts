import { buildZip } from '@goldstack/template-hetzner-vps-cli';

buildZip()
  .catch((e) => console.log(e))
  .then(() => console.log('VPS files build success'));
