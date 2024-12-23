import type { OpenNextConfig } from 'open-next/types/open-next';
const config: OpenNextConfig = {
  default: {},
  functions: {
    ssr: {
      routes: ['app/api/ssr/route'],
      patterns: ['api/ssr', 'api/ssr/*'],
    },
  },
};

export default config;
export type Config = typeof config;
