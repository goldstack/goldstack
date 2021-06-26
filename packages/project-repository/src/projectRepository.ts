import { connect, getBucketName } from '@goldstack/project-repository-bucket';

import ProjectRepositoryS3 from './ProjectRepositoryS3';

import ProjectRepository from './ProjectRepositoryInterface';

import ProjectData from './types/ProjectData';

export { ProjectData };

export const connectProjectRepository = async (
  deploymentName?: string
): Promise<ProjectRepository> => {
  const s3 = await connect(deploymentName);
  const bucketName = await getBucketName(deploymentName);
  return new ProjectRepositoryS3({ s3, bucketName });
};
