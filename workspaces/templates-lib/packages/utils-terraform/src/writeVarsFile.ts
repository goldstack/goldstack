import * as fs from 'fs';
import * as path from 'path';
import { Variables, formatTerraformValue } from './terraformCli';

const isJsonString = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

export function writeVarsFile(variables: Variables, dir: string): void {
  if (variables.length === 0) {
    return;
  }

  const varFileContent = variables
    .map(([key, value]) => {
      // Handle multiline strings by using heredoc syntax
      if (value.includes('\n')) {
        return `${key} = <<-EOT\n${value}\nEOT`;
      }

      // Handle JSON strings by parsing and formatting as Terraform map
      if (isJsonString(value)) {
        const parsed = JSON.parse(value);
        return `${key} = ${formatTerraformValue(parsed)}`;
      }

      // Handle regular strings with proper escaping
      const escapedValue = value
        .replace(/\\/g, '\\\\') // Escape backslashes first
        .replace(/"/g, '\\"'); // Escape quotes

      return `${key} = "${escapedValue}"`;
    })
    .join('\n');

  const varsFilePath = path.join(dir, 'terraform.tfvars');
  fs.writeFileSync(varsFilePath, varFileContent);
}
