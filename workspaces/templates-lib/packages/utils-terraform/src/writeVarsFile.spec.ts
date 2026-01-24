import { writeVarsFile } from './writeVarsFile';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('writeVarsFile', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'goldstack-test-'));
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('should escape special characters in strings', () => {
    const filePath = path.join(testDir, 'terraform.tfvars');
    const variables: [string, string][] = [
      ['var_with_dollar', 'value$with$dollar'],
      ['var_with_interpolation', 'value${interpolation}'],
      ['var_with_percent', 'value%percent'],
      ['var_with_percent_interpolation', 'value%{interpolation}'],
      ['var_with_backslash', 'C:\\path\\to\\file'],
      ['var_with_quotes', 'value "with" quotes'],
    ];

    writeVarsFile(variables, filePath);

    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('var_with_dollar = "value$with$dollar"');
    expect(content).toContain('var_with_interpolation = "value$${interpolation}"');
    expect(content).toContain('var_with_percent = "value%percent"');
    expect(content).toContain('var_with_percent_interpolation = "value%%{interpolation}"');
    expect(content).toContain('var_with_backslash = "C:\\\\path\\\\to\\\\file"');
    expect(content).toContain('var_with_quotes = "value \\"with\\" quotes"');
  });

  it('should escape special characters in multiline strings (heredoc)', () => {
    const filePath = path.join(testDir, 'terraform.tfvars');
    const variables: [string, string][] = [
      ['multiline', 'line1\nline2 with ${interpolation}\nline3'],
    ];

    writeVarsFile(variables, filePath);

    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('multiline = <<-EOT');
    expect(content).toContain('line2 with $${interpolation}');
  });

  it('should escape special characters in JSON strings', () => {
    const filePath = path.join(testDir, 'terraform.tfvars');
    const variables: [string, string][] = [
      ['json_var', '{"foo": "bar${baz}", "back": "C:\\\\path"}'],
    ];

    writeVarsFile(variables, filePath);

    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('"foo" = "bar$${baz}"');
    expect(content).toContain('"back" = "C:\\\\path"');
  });
});
