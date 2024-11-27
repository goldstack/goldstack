import * as fs from 'fs';
import * as path from 'path';
import { Variables } from './terraformCli';

export function writeBackendConfig(
  backendConfig: Variables,
  dir: string
): void {
  if (!backendConfig || backendConfig.length === 0) {
    return;
  }

  const bucket = backendConfig.find(([key]) => key === 'bucket')?.[1];
  const key = backendConfig.find(([key]) => key === 'key')?.[1];
  const dynamodbTable = backendConfig.find(
    ([key]) => key === 'dynamodb_table'
  )?.[1];
  const region = backendConfig.find(([key]) => key === 'region')?.[1];

  const backendContent = `# This is a generated file. DO NOT CHANGE!
  
terraform {
  backend "s3" {
    bucket = "${bucket}"
    key    = "${key}"
    region = "${region}"
    dynamodb_table = "${dynamodbTable}"

    # Skipping various checks to speed up backend initialisation
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true

    shared_config_files = ["aws_credentials"]
  }
}`;

  const backendPath = path.join(dir, 'backend.tf');
  fs.writeFileSync(backendPath, backendContent);
}
