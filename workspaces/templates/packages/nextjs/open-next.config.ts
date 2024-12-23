import type { OpenNextConfig } from 'open-next/types/open-next';
const config = {
  default: {},
  functions: {
    ssr: {
      routes: ['app/api/ssr/route'],
      patterns: ['api/ssr', 'api/ssr/*'],
    },
  },
} satisfies OpenNextConfig;

export default config;
export type Config = typeof config;