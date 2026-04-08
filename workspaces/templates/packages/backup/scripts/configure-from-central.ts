import { configureFromCentral } from '@goldstack/template-backup-cli';

configureFromCentral().catch((e) => {
  console.error('Failed to configure from central:', e.message);
  process.exit(1);
});
