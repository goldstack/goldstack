import assert from 'assert';
import { renderHostEnvironmentVariablesArray } from './utilsDocker';

describe('renderHostEnvironmentVariablesArray', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('Should render each environment variable as a separate docker argument', () => {
    process.env.GOLDSTACK_EXEC_TEST_VAR = 'value with spaces';

    const args = renderHostEnvironmentVariablesArray();
    const variableIndex = args.indexOf('GOLDSTACK_EXEC_TEST_VAR=value with spaces');

    assert(variableIndex >= 0, 'Expected environment variable to be rendered');
    assert.strictEqual(args[variableIndex - 1], '-e');
  });

  it('Should skip values that contain quotes or backslashes', () => {
    process.env.GOLDSTACK_EXEC_TEST_VAR = 'value "with quotes"';
    process.env.GOLDSTACK_EXEC_TEST_OTHER_VAR = 'value\\with\\backslashes';

    const args = renderHostEnvironmentVariablesArray();

    assert(!args.some((arg) => arg.startsWith('GOLDSTACK_EXEC_TEST_VAR=')));
    assert(!args.some((arg) => arg.startsWith('GOLDSTACK_EXEC_TEST_OTHER_VAR=')));
  });
});
