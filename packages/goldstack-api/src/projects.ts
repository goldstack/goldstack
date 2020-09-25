import { Router, Request, Response } from 'express';

import sanitizeHtml from 'sanitize-html';

import { connectProjectRepository } from '@goldstack/project-repository';

import { v4 as uuid4 } from 'uuid';
import { readProjectConfigFromString } from '@goldstack/utils-project';
import { mkdir, rmSafe, tempDir, read } from '@goldstack/utils-sh';

import { S3TemplateRepository } from '@goldstack/template-repository';
import { connect, getBucketName } from '@goldstack/template-repository-bucket';

import { buildProject } from '@goldstack/project-build';
import { getPackageConfigs } from '@goldstack/project-config';

import { ProjectData } from '@goldstack/project-repository';

import builds from './packages';

const router = Router();

export const postProjectHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userToken } = req.cookies;
    if (!userToken) {
      res
        .status(400)
        .json({ errorMessage: 'Expected userToken cookie to be set' });
      return;
    }
    const projectRepo = await connectProjectRepository();
    req.body.owner = userToken;
    try {
      readProjectConfigFromString(JSON.stringify(req.body));
    } catch (e) {
      console.warn('Invalid project config', e);
      res
        .status(400)
        .json({ errorMessage: `Invalid project configuration: ${e.message}` });
      return;
    }
    const projectId = await projectRepo.addProject(req.body);
    const buildDir = `${tempDir()}work/build/${projectId}/${uuid4()}/`;
    const templateS3 = await connect();
    const templateRepo = new S3TemplateRepository({
      bucket: await getBucketName(),
      bucketUrl: 's3',
      s3: templateS3,
    });
    mkdir('-p', buildDir);
    await buildProject({
      config: req.body,
      s3: templateRepo,
      destinationDirectory: buildDir,
    });
    await projectRepo.uploadProject(projectId, buildDir);
    const packageConfigs = getPackageConfigs(buildDir);
    await projectRepo.updateProjectData(projectId, {
      projectId,
      project: req.body,
      packageConfigs: packageConfigs,
      deploymentNames: ['dev'],
      awsUsers: [
        {
          name: 'awsUser',
          type: 'apiKey',
          config: {
            awsAccessKeyId: 'key',
            awsSecretAccessKey: 'secret',
            awsDefaultRegion: 'us-east-2',
          },
        },
      ],
    });
    await rmSafe(buildDir);
    res.status(200).json({ projectId: projectId, packageConfigs });
  } catch (e) {
    console.error('Error for post project', e);
    res.status(500).json({ errorMessage: e.message });
  }
};

export const getProjectHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { userToken } = req.cookies;
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
      res.status(404).json({ errorMessage: 'Project does not exist' });
    }
    if (project?.owner !== userToken) {
      res.status(404).json({ errorMessage: 'Not authorised' });
      return;
    }

    const projectData = await repo.getProjectData(projectId);
    res.status(200).json({ ...projectData, project });
  } catch (e) {
    console.error('Error for get project', e);
    res.status(500).json({ errorMessage: e.message });
  }
};

export const putProjectHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { body }: { body: ProjectData } = req;
    const { userToken } = req.cookies;
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
    const config = await repo.readProjectConfiguration(projectId);
    if (!config) {
      res.status(400).json({ errorMessage: 'Project does not exist' });
      return;
    }
    if (config?.owner !== userToken) {
      res.status(404).json({ errorMessage: 'Not authorised' });
      return;
    }
    const { project, packageConfigs } = body;
    project.owner = userToken;

    await repo.updateProjectConfiguration(projectId, project);
    if (packageConfigs) {
      await repo.updateProjectData(projectId, body);
    }
    res.status(200).json({ result: 'success' });
  } catch (e) {
    console.error('Error for put project', e);
    res.status(500).json({ errorMessage: e.message });
  }
};

export const getProjectDocsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { doc } = req.query;
    const { userToken } = req.cookies;
    if (!projectId) {
      res.status(400).json({ errorMessage: 'Expected projectId in request' });
      return;
    }
    if (!doc) {
      res.status(400).json({ errorMessage: 'Expected doc in request' });
      return;
    }
    const docs: string[] = Array.isArray(doc)
      ? (doc as string[])
      : [doc as string];

    if (!userToken) {
      res
        .status(400)
        .json({ errorMessage: 'Expected userToken cookie to be set' });
      return;
    }
    const repo = await connectProjectRepository();
    const workspacePath = `${tempDir()}work/get-project-docs/${projectId}/${uuid4()}/`;
    await repo.downloadProject(projectId, workspacePath);
    const packageConfigs = getPackageConfigs(workspacePath);

    const result = await Promise.all(
      packageConfigs.map(async (config) => {
        const packagePath = config.pathInWorkspace;
        const docPaths = docs.map((doc) => ({
          name: doc,
          path: `${workspacePath}${packagePath}/docs/${doc}.html`,
        }));

        return {
          package: config.package.name,
          docs: await Promise.all(
            docPaths.map(async (docPath) => {
              const html = sanitizeHtml(read(docPath.path));
              return {
                doc: docPath.name,
                html,
              };
            })
          ),
        };
      })
    );
    res.status(200).json(result);
  } catch (e) {
    console.error('Error for put project', e);
    res.status(500).json({ errorMessage: e.message });
  }
};

router.post('/', postProjectHandler);
router.get('/:projectId', getProjectHandler);
router.put('/:projectId', putProjectHandler);
router.get('/:projectId/docs', getProjectDocsHandler);

router.use('/:projectId/packages', builds);

export default router;
