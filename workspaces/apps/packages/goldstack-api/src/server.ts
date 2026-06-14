import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
// import requestLogger from 'express-requests-logger';
import type { Server } from 'http';
import { debug } from '@goldstack/utils-log';
import projects from './projects';
import sessions from './sessions';

export const app: express.Application = express();

debug('Server cold start');
app.use(helmet());
debug(`CORS config: ${process.env.CORS}`);
app.use(cors({ origin: process.env.CORS, credentials: true }));
app.use(cookieParser() as express.RequestHandler);
app.use(express.json({ limit: '10mb' }));

// if (process.env.GOLDSTACK_DEPLOYMENT !== 'local') {
//   app.use(requestLogger());
// }

app.get('/', (_req, res) => {
  res.send('Goldstack API');
});

app.use('/projects', projects);

app.use('/sessions', sessions);

export const start = async (port: number): Promise<Server> => {
  return new Promise<Server>((resolve, reject) => {
    const server = app.listen(port, () => {
      const addr = server.address();
      const actualPort = typeof addr === 'object' && addr ? addr.port : port;
      debug(`Server started on port ${actualPort}`);
      resolve(server);
    });
    server.on('error', (err: Error) => {
      debug(`Server failed to start on port ${port}: ${err.message}`);
      reject(err);
    });
  });
};
