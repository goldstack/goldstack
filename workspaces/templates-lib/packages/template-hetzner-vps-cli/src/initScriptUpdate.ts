import { readFileSync, writeFileSync } from 'fs';

export function updateCredentialsUrl(newUrl: string): void {
  const filePath = './infra/aws/cloud-init.yml';
  const fileContent = readFileSync(filePath, 'utf8');
  const updatedContent = fileContent.replace(
    /CREDENTIALS_URL="[^"]*"/,
    `CREDENTIALS_URL="${newUrl}"`
  );
  writeFileSync(filePath, updatedContent, 'utf8');
}

export function updateS3Bucket(newBucket: string): void {
  const filePath = './infra/aws/cloud-init.yml';
  const fileContent = readFileSync(filePath, 'utf8');
  const updatedContent = fileContent.replace(
    /S3_BUCKET="[^"]*"/,
    `S3_BUCKET="${newBucket}"`
  );
  writeFileSync(filePath, updatedContent, 'utf8');
}
