import { app } from './server';

const port = process.env.PORT || '3030';

app.listen(parseInt(port), function () {
  console.log(`Server is listening on port ${port}!`);
  console.log(`http://localhost:${port}/`);
});
