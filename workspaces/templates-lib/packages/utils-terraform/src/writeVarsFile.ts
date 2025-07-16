import * as fs from 'fs';
import * as path from 'path';
import type { Variables } from './terraformCli';

const isJsonString = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

const formatTerraformValue = (value: any): string => {
  if (typeof value === 'string') {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return `[${value.map(formatTerraformValue).join(', ')}]`;
  }
  if (typeof value === 'object' && value !== null) {
    return `{${Object.entries(value)
      .map(([k, v]) => `"${k}" = ${formatTerraformValue(v)}`)
      .join(', ')}}`;
  }
  return 'null';
};

export function writeVarsFile(variables: Variables, filePath: string): void {
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

  const varsFilePath = filePath; // path.join(dir, 'terraform.tfvars');

  fs.writeFileSync(
    varsFilePath,
    '# This file is generated. DO NOT CHANGE.\n\n' + varFileContent
  );
}
