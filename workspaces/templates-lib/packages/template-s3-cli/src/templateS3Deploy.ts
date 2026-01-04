import type { S3Configuration } from '@goldstack/template-s3';

export const deployCli = async (_config: S3Configuration, _args: string[]): Promise<void> => {
  throw new Error('Deploy not supported yet.');
};
