import { S3Configuration } from './types/S3Package';

export const deployCli = async (
  config: S3Configuration,
  args: string[]
): Promise<void> => {
  throw new Error('Deploy not supported yet.');
};
