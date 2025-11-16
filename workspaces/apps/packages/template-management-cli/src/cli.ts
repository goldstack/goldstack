/* eslint-disable @typescript-eslint/no-var-requires */
require('source-map-support').install();

import { run } from './templateManagementCli';

run()
  .catch((e) => {
    throw new Error('CLI command failed: ' + e.message, e);
  })
  .then(() => {});
