import assert from 'assert';
import { splitCommandString } from './utilsAwsCli';

describe('splitCommandString', () => {
  it('Should split arguments on whitespace', () => {
    assert.deepStrictEqual(splitCommandString('lambda get-function --function-name fn'), [
      'lambda',
      'get-function',
      '--function-name',
      'fn',
    ]);
  });

  it('Should ignore repeated whitespace', () => {
    assert.deepStrictEqual(splitCommandString('  s3   sync\t.\n s3://bucket  '), [
      's3',
      'sync',
      '.',
      's3://bucket',
    ]);
  });

  it('Should keep quoted values containing spaces as a single argument', () => {
    assert.deepStrictEqual(
      splitCommandString(`s3 sync . "s3://bucket/path with spaces" --cache-control 'max-age=60'`),
      ['s3', 'sync', '.', 's3://bucket/path with spaces', '--cache-control', 'max-age=60'],
    );
  });

  it('Should support escaped double quotes and backslashes', () => {
    assert.deepStrictEqual(splitCommandString('echo "say \\"hello\\"" "C:\\\\temp"'), [
      'echo',
      'say "hello"',
      'C:\\temp',
    ]);
  });

  it('Should preserve empty quoted arguments', () => {
    assert.deepStrictEqual(splitCommandString(`echo "" ''`), ['echo', '', '']);
  });

  it('Should reject unterminated quotes', () => {
    assert.throws(() => splitCommandString('echo "unterminated'), /Unterminated quote/);
  });
});
