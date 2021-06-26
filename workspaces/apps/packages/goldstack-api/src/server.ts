import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import projects from './projects';
import sessions from './sessions';
import requestLogger from 'express-requests-logger';

export const app: express.Application = express();

console.log('Server cold start');
app.use(helmet());
console.log('CORS config:', process.env.CORS);
app.use(cors({ origin: process.env.CORS, credentials: true }));
app.use(cookieParser());
app.use(express.json());

if (process.env.GOLDSTACK_DEPLOYMENT !== 'local') {
  app.use(requestLogger());
}

app.get('/', (req, res) => {
  res.send('Goldstack API');
});

app.use('/projects', projects);

app.use('/sessions', sessions);

export const start = async (port: number): Promise<any> => {
  return new Promise<any>((resolve) => {
    const server = app.listen(port, () => {
      resolve(server);
    });
  });
};
