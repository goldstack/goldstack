import Ajv from 'ajv';
import { globSync } from '@goldstack/utils-sh';

interface ValidateOptions {
  errorMessage?: string;
  additionalSchemas?: object[];
}

export const validateConfig = (
  config: object,
  schema: object,
  options?: ValidateOptions
): object => {
  const ajv = new Ajv();
  if (options?.additionalSchemas) {
    options.additionalSchemas.forEach((schema) => ajv.addSchema(schema));
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildError = (e: any): Error => {
    return new Error(
      `${options?.errorMessage || 'Cannot read configuration'}\n` +
        ajv.errorsText() ||
        '' + e ||
        ''
    );
  };
  let valid;
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

export const parseConfig = (
  data: string,
  schema: object,
  options: ValidateOptions
): object => {
  const config = JSON.parse(data);
  return validateConfig(config, schema, options);
};

export const getPackageConfigPaths = (workspacePath: string): string[] => {
  const res = globSync(workspacePath + 'packages/*/goldstack.json');
  return res;
};

export const getAwsConfigPath = (workspacePath: string): string => {
  return workspacePath + 'config/infra/aws/config.json';
};

export const getAwsTerraformConfigPath = (workspacePath: string): string => {
  return workspacePath + 'config/infra/aws/terraform.json';
};
