'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const server_1 = require('./server');
const port = process.env.PORT || '3030';
server_1.app.listen(parseInt(port, 10), () => {
  console.log(`Server is listening on port ${port}!`);
  console.log(`http://localhost:${port}/`);
});
//# sourceMappingURL=local.js.map
