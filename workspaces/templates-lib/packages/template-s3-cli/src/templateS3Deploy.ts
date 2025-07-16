import type { S3Configuration } from '@goldstack/template-s3';

export const deployCli = async (
  config: S3Configuration,
  args: string[]
): Promise<void> => {
  throw new Error('Deploy not supported yet.');
};
