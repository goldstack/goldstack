require('source-map-support').install();
import { app } from './server';

process.env.GOLDSTACK_DEPLOYMENT = 'local';

const port: number = parseInt(process.env.PORT || '3000', 10);

app.listen(port, function () {
  console.log(`Server is listening on port ${port}!`);
  console.log(`http://localhost:${port}/`);
});
