import { startServer } from '@goldstack/utils-aws-http-api-local';

const port = process.env.PORT || '5054';

const cors = process.env.CORS;

if (cors) {
  console.info(`Starting server with CORS domain: ${process.env.CORS}`);
}
startServer({
  port,
  routesDir: './src/routes',
  cors,
})
  .then(() => {
    console.log(`API listening on port ${port}!`);
    console.log(`http://localhost:${port}/`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
