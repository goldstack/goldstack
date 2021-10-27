require('source-map-support').install();
import { run } from './templateManagementCli';

run()
  .catch((e) => {
    console.log(e);
    console.log('Unexpected invocation of top level cli handler.');
  })
  .then(() => {
    console.log('Unexpected invocation of top level cli handler.');
  });
