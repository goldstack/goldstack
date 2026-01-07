import { globSync } from '@goldstack/utils-sh';
import Ajv from 'ajv';

interface ValidateOptions {
  errorMessage?: string;
  additionalSchemas?: object[];
}

export const validateConfig = (
  config: object,
  schema: object,
  options?: ValidateOptions,
): object => {
  const ajv = new Ajv();
  if (options?.additionalSchemas) {
    options.additionalSchemas.forEach((schema) => {
      ajv.addSchema(schema);
    });
  }

  const buildError = (e: any): Error => {
    return new Error(
      `${options?.errorMessage || 'Cannot read configuration'}\n${ajv.errorsText()}` ||
        `${e}` ||
        '',
    );
  };
  let valid: boolean | PromiseLike<any>;
  try {
    valid = ajv.validate(schema, config);
  } catch (e) {
    throw buildError(e);
  }
  if (!valid) {
    throw buildError(null);
  }
  return config;
};

export const parseConfig = (data: string, schema: object, options: ValidateOptions): object => {
  const config = JSON.parse(data);
  return validateConfig(config, schema, options);
};

export const getPackageConfigPaths = (workspacePath: string): string[] => {
  const res = globSync(`${workspacePath.replace(/\\/g, '/')}packages/*/goldstack.json`);
  return res;
};

export const getAwsConfigPath = (workspacePath: string): string => {
  return `${workspacePath}config/infra/aws/config.json`;
};

export const getHetznerConfigPath = (workspacePath: string): string => {
  return `${workspacePath}config/infra/hetzner/config.json`;
};

export const getAwsTerraformConfigPath = (workspacePath: string): string => {
  return `${workspacePath}config/infra/aws/terraform.json`;
};
