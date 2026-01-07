import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { writePackageConfigs } from '@goldstack/project-config';
import { connect, getBucketName, getSignedUrl } from '@goldstack/project-package-bucket';
import type { ProjectData } from '@goldstack/project-repository';
import { connectProjectRepository } from '@goldstack/project-repository';
import { connectSessionRepository } from '@goldstack/session-repository';
import { goldstackLocalDir, mkdir, read, rmSafe, write, zip } from '@goldstack/utils-sh';
import assert from 'assert';
import { type Request, type Response, Router } from 'express';
import fs from 'fs';
import { join } from 'path';
import sortPackageJson from 'sort-package-json';
import { v4 as uuid4 } from 'uuid';
import { isSessionPaid } from './lib/stripe';

const router = Router({
  mergeParams: true,
});

function sortKeys(obj: Record<string, unknown>): Record<string, unknown> {
  return sortPackageJson(obj);
}

const writePackage = async (params: {
  projectId: string;
  packageId: string;
  userToken: string;
  projectData: ProjectData;
  res: Response;
}): Promise<void> => {
  const projectId = params.projectId;
  const userToken = params.userToken;
  const projectData = params.projectData;
  const packageId = params.packageId;
  const res = params.res;
  if (!projectId) {
    res.status(400).json({ errorMessage: 'Expected projectId in request' });
    return;
  }
  if (!userToken) {
    res.status(400).json({ errorMessage: 'Expected userToken cookie to be set' });
    return;
  }
  const repo = await connectProjectRepository();
  const project = await repo.readProjectConfiguration(projectId);

  if (!project) {
    res.status(400).json({ errorMessage: 'Project does not exist' });
    return;
  }
  if (project?.owner !== userToken) {
    res.status(404).json({ errorMessage: 'Not authorised' });
    return;
  }

  const path = `${goldstackLocalDir()}work/post-project-package/${projectId}/${packageId}/`;
  await rmSafe(path);
  mkdir('-p', path);

  await repo.downloadProject(projectId, path);

  // write latest version for project config
  const owner = project.owner;
  project.owner = undefined;
  write(JSON.stringify(project, null, 2), join(path, 'project.json'));

  // write owner into gitignored config file
  write(JSON.stringify({ owner }, null, 2), join(path, 'config/goldstack/config.json'));

  // set project name in package json
  const packageJson = JSON.parse(read(join(path, 'package.json')));
  packageJson.name = project.projectName || '';
  write(JSON.stringify(sortKeys(packageJson), null, 2), join(path, 'package.json'));

  // write latest version for package configs
  const { packageConfigs } = await repo.getProjectData(projectId);
  writePackageConfigs(path, packageConfigs);

  // write aws user config
  const userConfigPath = join(path, 'config/infra/aws/config.json');
  write(JSON.stringify({ users: projectData.awsUsers }, null, 2), userConfigPath);

  const zipPath = `${goldstackLocalDir()}work/post-project-package/${projectId}/${packageId}.zip`;
  await zip({ directory: path, target: zipPath });

  const packageBucket = await connect();

  const packageData = {
    packageId,
    projectId,
    owner: project.owner,
    createdAt: new Date().toISOString(),
    projectData,
  };

  await packageBucket.send(
    new PutObjectCommand({
      Bucket: await getBucketName(),
      Key: `${projectId}/${packageId}/package.json`,
      Body: JSON.stringify(packageData, null, 2),
    }),
  );

  await packageBucket.send(
    new PutObjectCommand({
      Bucket: await getBucketName(),
      Key: `${projectId}/${packageId}/package.zip`,
      Body: fs.createReadStream(zipPath),
    }),
  );

  await rmSafe(path);
};

export const postPackageHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { userToken } = req.cookies;
    const { body: projectData }: { body: ProjectData } = req;
    const packageId = uuid4();

    await writePackage({
      projectId,
      packageId,
      userToken,
      projectData,
      res,
    });

    res.status(200).json({ projectId, packageId });
  } catch (e) {
    console.error('Cannot post package for project', e);
    res.status(500).json({ errorMessage: e.message });
    return;
  }
};

export const putPackageHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, packageId } = req.params;
    const { userToken } = req.cookies;
    const { body: projectData }: { body: ProjectData } = req;

    await writePackage({
      projectId,
      packageId,
      userToken,
      projectData,
      res,
    });

    res.status(200).json({ projectId, packageId });
  } catch (e) {
    console.error('Cannot put package for project', e);
    res.status(500).json({ errorMessage: e.message });
    return;
  }
};

export const getPackageHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, packageId } = req.params;
    const { userToken } = req.cookies;
    if (!projectId || !packageId) {
      res.status(400).json({ errorMessage: 'Expected projectId and packageId in request' });
      return;
    }
    if (!userToken) {
      res.status(400).json({ errorMessage: 'Expected userToken cookie to be set' });
      return;
    }
    const repo = await connectProjectRepository();
    const project = await repo.readProjectConfiguration(projectId);

    if (!project) {
      res.status(404).json({ errorMessage: 'Project does not exist' });
      return;
    }
    if (project?.owner !== userToken) {
      res.status(404).json({ errorMessage: 'Not authorised' });
      return;
    }

    // Check payment processed
    const sessionRepo = await connectSessionRepository();
    const sessionData = await sessionRepo.readSession(userToken);
    if (!sessionData) {
      console.error('Cannot retrieve session data for', userToken);
      res.status(500).json({ errorMessage: `Cannot retrieve session data ${userToken}` });
      return;
    }

    // If no payment has been processed, do not return download URL
    if (!(sessionData?.coupon || sessionData?.stripeId)) {
      res.status(200).json({
        error: 'not-paid',
        stripeId: sessionData.stripeId,
      });
      return;
    }

    if (!sessionData?.coupon) {
      assert(sessionData.stripeId, 'Session data stripe id not defined.');
      const paid = await isSessionPaid({ sessionId: sessionData.stripeId });
      if (!paid) {
        res.status(200).json({
          error: 'not-paid',
          stripeId: sessionData.stripeId,
        });
        return;
      }
    }

    // generate download URL
    const packageBucket = await connect();
    const bucketName = await getBucketName();
    const downloadUrl = await getSignedUrl(
      packageBucket,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: `${projectId}/${packageId}/package.zip`,
      }),
      {
        expiresIn: 3000, // duration in seconds that link will be valid for
      },
    );
    res.status(200).json({ downloadUrl });
    return;
  } catch (e) {
    console.error('Error for get package', e);
    res.status(500).json({ errorMessage: e.message });
  }
};

router.post('/', postPackageHandler);

router.get('/:packageId', getPackageHandler);

router.put('/:packageId', putPackageHandler);

export default router;
