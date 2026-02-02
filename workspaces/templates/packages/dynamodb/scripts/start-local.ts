import * as fs from 'fs';
import * as path from 'path';
import { connect, startLocalDynamoDB } from './../src/table';

(async () => {
  try {
    // Set deployment environment
    process.env.GOLDSTACK_DEPLOYMENT = 'local';

    // Clear any existing log file
    const logFile = path.join(process.cwd(), 'dynamodb-local.log');
    if (fs.existsSync(logFile)) {
      fs.unlinkSync(logFile);
    }

    console.log('Starting local DynamoDB instance...');
    console.log('Logs will be written to: dynamodb-local.log');

    await startLocalDynamoDB({ detached: true });
    // need to do connect to run initial migrations
    await connect();

    // Log success
    const logStream = fs.createWriteStream(logFile, { flags: 'a' });
    logStream.write('Local DynamoDB instance started successfully on port 8000\n');
    logStream.write('To stop the instance, run: yarn stop-local\n');

    console.log('Local DynamoDB instance started successfully on port 8000');
    console.log('To stop the instance, run: yarn stop-local');
    process.exit(0);
  } catch (error) {
    console.error('Failed to start local DynamoDB instance:', error);

    // Log error
    const logFile = path.join(process.cwd(), 'dynamodb-local.log');
    const logStream = fs.createWriteStream(logFile, { flags: 'a' });
    logStream.write(`Failed to start local DynamoDB instance: ${error}\n`);

    process.exit(1);
  }
})();
