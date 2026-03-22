import assert from 'assert';
import { isValidState } from './state';

describe('isValidState', () => {
  it('should accept valid relative paths', () => {
    assert(isValidState('/app'));
    assert(isValidState('/app/automation/xxx'));
    assert(isValidState('/app/automation/019d17e5-xxx/skill/019d17e5-xxx'));
    assert(isValidState('/app?query=value'));
    assert(isValidState('/app#anchor'));
  });

  it('should reject protocol-relative URLs', () => {
    assert(!isValidState('//example.com'));
    assert(!isValidState('//example.com/path'));
  });

  it('should reject absolute URLs', () => {
    assert(!isValidState('https://example.com'));
    assert(!isValidState('http://example.com'));
    assert(!isValidState('ftp://example.com'));
  });

  it('should reject paths without leading slash', () => {
    assert(!isValidState('app/path'));
    assert(!isValidState('relative'));
  });

  it('should reject empty string', () => {
    assert(!isValidState(''));
  });

  it('should accept root path', () => {
    assert(isValidState('/'));
  });

  it('should accept paths with special characters', () => {
    assert(isValidState('/app/test%20space'));
    assert(isValidState('/app/test?a=1&b=2'));
    assert(isValidState('/app/test#section'));
  });

  it('should reject URLs with colon-slash-slash anywhere', () => {
    assert(!isValidState('/app/https://evil.com'));
    assert(!isValidState('/path/http://example.com'));
  });
});
