import { run } from './../src/ghaAgentCliRun';

run()
  .then(() => {})
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
