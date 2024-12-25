import { startServer } from '@goldstack/utils-aws-http-api-local';

const port = process.env.PORT || '5054';

const cors = process.env.CORS;

if (cors) {
  console.info(`Starting server with CORS domain: ${process.env.CORS}`);
}
const versionTimestamp = {
  value: new Date().toISOString(),
  path: '/_goldstack/local/versionTimestamp',
};
console.info('Starting API server');
startServer({
  port,
  routesDir: './src/routes',
  cors,
  versionTimestamp,
  staticRoutes: {
    '/_goldstack/static': {
      path: 'static',
      options: {
        immutable: true,
        maxAge: 1000 * 60 * 60 * 24,
      },
    },
    '/_goldstack/public': 'public',
    '/': 'public',
  },
})
  .then(() => {
    console.info(`API listening on port ${port}!`);
    console.info(`http://localhost:${port}/`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
