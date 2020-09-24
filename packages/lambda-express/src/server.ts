import express from 'express';
import helmet from 'helmet';

import { rootHandler } from './root';

export const app: express.Application = express();

app.use(helmet());

app.get('/', rootHandler);
