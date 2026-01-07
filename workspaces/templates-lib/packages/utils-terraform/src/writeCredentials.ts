import * as fs from 'fs';
import * as path from 'path';
import { writeVarsFile } from './writeVarsFile';

export function writeCredentials(envVarString: string, dir: string): void {
  const envVars = envVarString
    .trim()
    .split(' -e ')
    .filter((v) => v)
    .map((v) => v.trim())
    .reduce(
      (acc, curr) => {
        // Remove any leading '-e ' that might have been included in the split
        const cleaned = curr.replace(/^-e\s+/, '');
        const [key, ...valueParts] = cleaned.split('=');
        // Join value parts back together in case the value itself contained '='
        const value = valueParts.join('=');
        if (key && value) {
          acc[key] = value.replace(/["']/g, '');
        }
        return acc;
      },
      {} as Record<string, string>,
    );

  if (envVars.AWS_ACCESS_KEY_ID) {
    const credContent = `# This file is generated. Do not change it
  
[default]
aws_access_key_id = ${envVars.AWS_ACCESS_KEY_ID || ''}
aws_secret_access_key = ${envVars.AWS_SECRET_ACCESS_KEY || ''}
aws_region = ${envVars.AWS_REGION || envVars.AWS_DEFAULT_REGION || ''}`;

    const credentialsPath = path.join(dir, 'aws_credentials');
    fs.writeFileSync(credentialsPath, credContent);
  }

  if (envVars.TF_VAR_hcloud_token) {
    const hcloud_token = envVars.TF_VAR_hcloud_token;
    writeVarsFile([['hcloud_token', hcloud_token]], path.join(dir, 'hetzner.auto.tfvars'));
  }
}
