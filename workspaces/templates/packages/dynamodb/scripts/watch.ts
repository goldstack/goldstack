import { connect, stopLocalDynamoDB } from './../src/table';
import * as readline from 'readline';

(async () => {
  await connect();
  await new Promise((resolve) => {
    const prompt = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    prompt.question('Press enter to shutdown DynamoDB database', () => {
      resolve(null);
      prompt.close();
    });
  });
  await stopLocalDynamoDB();
})();
