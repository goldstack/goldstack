'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.getProjectDocsHandler =
  exports.putProjectHandler =
  exports.getProjectHandler =
  exports.postProjectHandler =
    void 0;
const project_build_1 = require('@goldstack/project-build');
const project_config_1 = require('@goldstack/project-config');
const project_repository_1 = require('@goldstack/project-repository');
const template_repository_1 = require('@goldstack/template-repository');
const template_repository_bucket_1 = require('@goldstack/template-repository-bucket');
const utils_project_1 = require('@goldstack/utils-project');
const utils_sh_1 = require('@goldstack/utils-sh');
const express_1 = require('express');
const path_1 = require('path');
const sanitize_html_1 = __importDefault(require('sanitize-html'));
const uuid_1 = require('uuid');
const packages_1 = __importDefault(require('./packages'));
const docLinks_1 = require('./utils/docLinks');
const router = (0, express_1.Router)();
const postProjectHandler = async (req, res) => {
  try {
    const { userToken } = req.cookies;
    if (!userToken) {
      res.status(400).json({ errorMessage: 'Expected userToken cookie to be set' });
      return;
    }
    const projectRepo = await (0, project_repository_1.connectProjectRepository)();
    req.body.owner = userToken;
    try {
      (0, utils_project_1.readProjectConfigFromString)(JSON.stringify(req.body));
    } catch (e) {
      console.warn('Invalid project config', e);
      res.status(400).json({ errorMessage: `Invalid project configuration: ${e.message}` });
      return;
    }
    const projectId = await projectRepo.addProject(req.body);
    const buildDir = `${(0, utils_sh_1.goldstackLocalDir)()}work/build/${projectId}/${(0, uuid_1.v4)()}/`;
    const templateS3 = await (0, template_repository_bucket_1.connect)();
    const templateRepo = new template_repository_1.S3TemplateRepository({
      bucket: await (0, template_repository_bucket_1.getBucketName)(),
      bucketUrl: 's3',
      s3: templateS3,
      workDir: (0, path_1.join)((0, utils_sh_1.goldstackLocalDir)(), 'template-repo-work'),
    });
    (0, utils_sh_1.mkdir)('-p', buildDir);
    await (0, project_build_1.buildProject)({
      config: req.body,
      s3: templateRepo,
      projectDirectory: buildDir,
    });
    await projectRepo.uploadProject(projectId, buildDir);
    const packageConfigs = (0, project_config_1.getPackageConfigs)(buildDir);
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
            awsAccessKeyId: '',
            awsSecretAccessKey: '',
            awsDefaultRegion: 'us-east-2',
          },
        },
      ],
    });
    await (0, utils_sh_1.rmSafe)(buildDir);
    res.status(200).json({ projectId: projectId, packageConfigs });
  } catch (e) {
    console.error('Error for post project', e);
    res.status(500).json({ errorMessage: e.message });
  }
};
exports.postProjectHandler = postProjectHandler;
const getProjectHandler = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userToken } = req.cookies;
    if (!projectId) {
      res.status(400).json({ errorMessage: 'Expected projectId in request' });
      return;
    }
    if (!userToken) {
      res.status(400).json({ errorMessage: 'Expected userToken cookie to be set' });
      return;
    }
    const repo = await (0, project_repository_1.connectProjectRepository)();
    const project = await repo.readProjectConfiguration(projectId);
    if (!project) {
      res.status(404).json({ errorMessage: 'Project does not exist' });
    }
    if ((project === null || project === void 0 ? void 0 : project.owner) !== userToken) {
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
exports.getProjectHandler = getProjectHandler;
const putProjectHandler = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { body } = req;
    const { userToken } = req.cookies;
    if (!projectId) {
      res.status(400).json({ errorMessage: 'Expected projectId in request' });
      return;
    }
    if (!userToken) {
      res.status(400).json({ errorMessage: 'Expected userToken cookie to be set' });
      return;
    }
    const repo = await (0, project_repository_1.connectProjectRepository)();
    const config = await repo.readProjectConfiguration(projectId);
    if (!config) {
      res.status(400).json({ errorMessage: 'Project does not exist' });
      return;
    }
    if ((config === null || config === void 0 ? void 0 : config.owner) !== userToken) {
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
exports.putProjectHandler = putProjectHandler;
const getProjectDocsHandler = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { doc, linksOnly: links } = req.query;
    const { userToken } = req.cookies;
    if (!projectId) {
      res.status(400).json({ errorMessage: 'Expected projectId in request' });
      return;
    }
    if (!userToken) {
      res.status(400).json({ errorMessage: 'Expected userToken cookie to be set' });
      return;
    }
    const repo = await (0, project_repository_1.connectProjectRepository)();
    const workspacePath = `${(0, utils_sh_1.goldstackLocalDir)()}work/get-project-docs/${projectId}/${(0, uuid_1.v4)()}/`;
    await repo.downloadProject(projectId, workspacePath);
    if (!links) {
      if (!doc) {
        res.status(400).json({ errorMessage: 'Expected doc in request' });
        return;
      }
      const docs = Array.isArray(doc) ? doc : [doc];
      // send over actual rendered content of documentation
      const packageConfigs = (0, project_config_1.getPackageConfigs)(workspacePath);
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
                const html = (0, sanitize_html_1.default)((0, utils_sh_1.read)(docPath.path));
                return {
                  doc: docPath.name,
                  html,
                };
              }),
            ),
          };
        }),
      );
      res.status(200).json(result);
    } else {
      // send over just the links to the documentation
      const links = await (0, docLinks_1.getDocLinks)(workspacePath);
      res.status(200).json(links);
    }
    await (0, utils_sh_1.rmSafe)(workspacePath);
  } catch (e) {
    console.error('Error for put project', e);
    res.status(500).json({ errorMessage: e.message });
  }
};
exports.getProjectDocsHandler = getProjectDocsHandler;
router.post('/', exports.postProjectHandler);
router.get('/:projectId', exports.getProjectHandler);
router.put('/:projectId', exports.putProjectHandler);
router.get('/:projectId/docs', exports.getProjectDocsHandler);
router.use('/:projectId/packages', packages_1.default);
exports.default = router;
//# sourceMappingURL=projects.js.map
