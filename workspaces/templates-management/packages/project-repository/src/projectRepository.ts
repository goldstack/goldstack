import { connect, getBucketName } from '@goldstack/project-repository-bucket';

import ProjectRepositoryS3 from './ProjectRepositoryS3';

import type ProjectRepository from './ProjectRepositoryInterface';

import type ProjectData from './types/ProjectData';

export type { ProjectData };

export const connectProjectRepository = async (
  deploymentName?: string,
): Promise<ProjectRepository> => {
  const s3 = await connect(deploymentName);
  const bucketName = await getBucketName(deploymentName);
  return new ProjectRepositoryS3({ s3, bucketName });
};
