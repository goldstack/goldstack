import * as fs from 'fs';
import type { Variables } from './terraformCli';

const isJsonString = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch (_e) {
    return false;
  }
};

/**
 * Escapes a string for use in Terraform HCL.
 * Handles backslashes, quotes, and interpolation/directive sequences (${ and %{).
 */
export const terraformEscape = (value: string): string => {
  return value
    .replace(/\\/g, '\\\\') // Escape backslashes first
    .replace(/"/g, '\\"') // Escape quotes
    .replace(/\$\{/g, () => '$${') // Escape ${ as $${
    .replace(/%\{/g, () => '%%{'); // Escape %{ as %%{
};

/**
 * Escapes a string for use in Terraform HCL heredoc.
 * Only handles interpolation/directive sequences (${ and %{).
 */
export const terraformEscapeHeredoc = (value: string): string => {
  return value
    .replace(/\$\{/g, () => '$${') // Escape ${ as $${
    .replace(/%\{/g, () => '%%{'); // Escape %{ as %%{
};

export const formatTerraformValue = (value: unknown): string => {
  if (typeof value === 'string') {
    return `"${terraformEscape(value)}"`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return `[${value.map(formatTerraformValue).join(', ')}]`;
  }
  if (typeof value === 'object' && value !== null) {
    return `{${Object.entries(value)
      .map(([k, v]) => `"${terraformEscape(k)}" = ${formatTerraformValue(v)}`)
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
        return `${key} = <<-EOT\n${terraformEscapeHeredoc(value)}\nEOT`;
      }

      // Handle JSON strings by parsing and formatting as Terraform map
      if (isJsonString(value)) {
        const parsed = JSON.parse(value);
        return `${key} = ${formatTerraformValue(parsed)}`;
      }

      // Handle regular strings with proper escaping
      return `${key} = "${terraformEscape(value)}"`;
    })
    .join('\n');

  const varsFilePath = filePath; // path.join(dir, 'terraform.tfvars');

  fs.writeFileSync(varsFilePath, `# This file is generated. DO NOT CHANGE.\n\n${varFileContent}`);
}
