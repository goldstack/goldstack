import { Router, Request, Response } from 'express';

import { connectProjectRepository } from '@goldstack/project-repository';
import { connect, getBucketName } from '@goldstack/project-package-bucket';

import { v4 as uuid4 } from 'uuid';
import { mkdir, rmSafe, tempDir, write, zip, read } from '@goldstack/utils-sh';

import { connectSessionRepository } from '@goldstack/session-repository';
import { writePackageConfigs } from '@goldstack/project-config';
import { ProjectData } from '@goldstack/project-repository';

import { createSession, isSessionPaid } from './lib/stripe';

import fs from 'fs';
import assert from 'assert';

const router = Router({
  mergeParams: true,
});

export const postPackageHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { userToken } = req.cookies;
    const { body: projectData }: { body: ProjectData } = req;
    if (!projectId) {
      res.status(400).json({ errorMessage: 'Expected projectId in request' });
      return;
    }
    if (!userToken) {
      res
        .status(400)
        .json({ errorMessage: 'Expected userToken cookie to be set' });
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

    const packageId = uuid4();
    const path = `${tempDir()}work/post-project-package/${projectId}/${packageId}/`;
    await rmSafe(path);
    mkdir('-p', path);

    await repo.downloadProject(projectId, path);

    // write latest version for project config
    const owner = project.owner;
    project.owner = undefined;
    write(JSON.stringify(project, null, 2), path + 'project.json');

    // write owner into gitignored config file
    write(
      JSON.stringify({ owner }, null, 2),
      path + 'config/goldstack/config.json'
    );

    // set project name in package json
    const packageJson = JSON.parse(read(path + 'package.json'));
    packageJson.name = project.projectName || '';
    write(JSON.stringify(packageJson, null, 2), path + 'package.json');

    // write latest version for package configs
    const { packageConfigs } = await repo.getProjectData(projectId);
    writePackageConfigs(path, packageConfigs);

    // write aws user config
    const userConfigPath = path + 'config/infra/aws/config.json';
    write(
      JSON.stringify({ users: projectData.awsUsers }, null, 2),
      userConfigPath
    );

    const zipPath = `${tempDir()}work/post-project-package/${projectId}/${packageId}.zip`;
    await zip({ directory: path, target: zipPath });

    const packageBucket = await connect();

    const packageData = {
      packageId,
      projectId,
      owner: project.owner,
      createdAt: new Date().toISOString(),
      projectData,
    };

    await packageBucket
      .putObject({
        Bucket: await getBucketName(),
        Key: `${projectId}/${packageId}/package.json`,
        Body: JSON.stringify(packageData, null, 2),
      })
      .promise();

    await packageBucket
      .putObject({
        Bucket: await getBucketName(),
        Key: `${projectId}/${packageId}/package.zip`,
        Body: fs.createReadStream(zipPath),
      })
      .promise();

    const sessionRepo = await connectSessionRepository();

    const sessionData = await sessionRepo.readSession(userToken);

    if (!sessionData?.stripeId) {
      const stripeId = await createSession({ projectId, packageId });
      await sessionRepo.storeStripeId({
        sessionId: userToken,
        stripeId: stripeId.id,
      });
    }

    res.status(200).json({ projectId, packageId });
    await rmSafe(path);
  } catch (e) {
    console.error('Cannot post package for project', e);
    res.status(500).json({ errorMessage: e.message });
    return;
  }
};

export const getPackageHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { projectId, packageId } = req.params;
    const { userToken } = req.cookies;
    if (!projectId || !packageId) {
      res
        .status(400)
        .json({ errorMessage: 'Expected projectId and packageId in request' });
      return;
    }
    if (!userToken) {
      res
        .status(400)
        .json({ errorMessage: 'Expected userToken cookie to be set' });
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
      res
        .status(500)
        .json({ errorMessage: 'Cannot retrieve session data ' + userToken });
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
    const downloadUrl = await new Promise((resolve, reject) => {
      packageBucket.getSignedUrl(
        'getObject',
        {
          Bucket: bucketName,
          Key: `${projectId}/${packageId}/package.zip`,
          Expires: 3000, // duration in seconds that link will be valid for
        },
        (err, url) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(url);
        }
      );
    });
    res.status(200).json({ downloadUrl });
    return;
  } catch (e) {
    console.error('Error for get package', e);
    res.status(500).json({ errorMessage: e.message });
  }
};

router.post('/', postPackageHandler);

router.get('/:packageId', getPackageHandler);

export default router;
