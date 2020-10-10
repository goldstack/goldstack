require('source-map-support').install();
import { app } from './server';

process.env.GOLDSTACK_DEPLOYMENT = 'local';

const port: number = parseInt(process.env.PORT || '3000', 10);

app.listen(port, function () {
  console.log(`Server is listening on port ${port}!`);
  console.log(`http://localhost:${port}/`);
});

// this does not work with nodemon for some reason
// process.once('SIGUSR2', () => {
//   console.log('SIGTERM signal received. Closing HTTP server');

//   server.close(() => {
//     process.kill(process.pid, 'SIGUSR2');
//     console.log('HTTP server closed');
//   });
// });
