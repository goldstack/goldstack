import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { rootHandler } from './root';

export const app: express.Application = express();

app.use(helmet());
if (process.env.CORS) {
  console.info(`Starting server with CORS domain: ${process.env.CORS}`);
  app.use(cors({ origin: process.env.CORS, credentials: true }));
}
app.use(express.json());
app.get('/', rootHandler);
