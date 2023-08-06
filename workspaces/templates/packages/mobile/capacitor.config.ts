import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'party.goldstack.template',
  appName: '@goldstack/mobile',
  webDir: 'webDist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
