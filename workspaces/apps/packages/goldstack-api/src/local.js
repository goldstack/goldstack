'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
require('source-map-support').install();
const server_1 = require('./server');
process.env.GOLDSTACK_DEPLOYMENT = 'local';
const port = parseInt(process.env.PORT || '3000', 10);
server_1.app.listen(port, () => {
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
//# sourceMappingURL=local.js.map
