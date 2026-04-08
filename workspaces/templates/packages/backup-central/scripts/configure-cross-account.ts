import { configureCrossAccount } from '@goldstack/template-backup-central-cli';

configureCrossAccount().catch((e) => {
  console.error('Failed to configure cross-account:', e.message);
  process.exit(1);
});
