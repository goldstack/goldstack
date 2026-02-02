import { stopAllLocalDynamoDB, stopLocalDynamoDB } from './../src/table';

(async () => {
  try {
    console.log('Stopping local DynamoDB instance...');
    await stopLocalDynamoDB();
    await stopAllLocalDynamoDB();
    console.log('Local DynamoDB instance stopped successfully');
  } catch (error) {
    console.error('Failed to stop local DynamoDB instance:', error);
    process.exit(1);
  }
})();
