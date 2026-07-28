'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.getPackageHandler = exports.putPackageHandler = exports.postPackageHandler = void 0;
const client_s3_1 = require('@aws-sdk/client-s3');
const project_config_1 = require('@goldstack/project-config');
const project_package_bucket_1 = require('@goldstack/project-package-bucket');
const project_repository_1 = require('@goldstack/project-repository');
const session_repository_1 = require('@goldstack/session-repository');
const utils_sh_1 = require('@goldstack/utils-sh');
const assert_1 = __importDefault(require('assert'));
const express_1 = require('express');
const fs_1 = __importDefault(require('fs'));
const path_1 = require('path');
const sort_package_json_1 = __importDefault(require('sort-package-json'));
const uuid_1 = require('uuid');
const stripe_1 = require('./lib/stripe');
const router = (0, express_1.Router)({
  mergeParams: true,
});
function sortKeys(obj) {
  return (0, sort_package_json_1.default)(obj);
}
const writePackage = async (params) => {
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
  const repo = await (0, project_repository_1.connectProjectRepository)();
  const project = await repo.readProjectConfiguration(projectId);
  if (!project) {
    res.status(400).json({ errorMessage: 'Project does not exist' });
    return;
  }
  if ((project === null || project === void 0 ? void 0 : project.owner) !== userToken) {
    res.status(404).json({ errorMessage: 'Not authorised' });
    return;
  }
  const path = `${(0, utils_sh_1.goldstackLocalDir)()}work/post-project-package/${projectId}/${packageId}/`;
  await (0, utils_sh_1.rmSafe)(path);
  (0, utils_sh_1.mkdir)('-p', path);
  await repo.downloadProject(projectId, path);
  // write latest version for project config
  const owner = project.owner;
  project.owner = undefined;
  (0, utils_sh_1.write)(JSON.stringify(project, null, 2), (0, path_1.join)(path, 'project.json'));
  // write owner into gitignored config file
  (0, utils_sh_1.write)(
    JSON.stringify({ owner }, null, 2),
    (0, path_1.join)(path, 'config/goldstack/config.json'),
  );
  // set project name in package json
  const packageJson = JSON.parse((0, utils_sh_1.read)((0, path_1.join)(path, 'package.json')));
  packageJson.name = project.projectName || '';
  (0, utils_sh_1.write)(
    JSON.stringify(sortKeys(packageJson), null, 2),
    (0, path_1.join)(path, 'package.json'),
  );
  // write latest version for package configs
  const { packageConfigs } = await repo.getProjectData(projectId);
  (0, project_config_1.writePackageConfigs)(path, packageConfigs);
  // write aws user config
  const userConfigPath = (0, path_1.join)(path, 'config/infra/aws/config.json');
  (0, utils_sh_1.write)(JSON.stringify({ users: projectData.awsUsers }, null, 2), userConfigPath);
  const zipPath = `${(0, utils_sh_1.goldstackLocalDir)()}work/post-project-package/${projectId}/${packageId}.zip`;
  await (0, utils_sh_1.zip)({ directory: path, target: zipPath });
  const packageBucket = await (0, project_package_bucket_1.connect)();
  const packageData = {
    packageId,
    projectId,
    owner: project.owner,
    createdAt: new Date().toISOString(),
    projectData,
  };
  await packageBucket.send(
    new client_s3_1.PutObjectCommand({
      Bucket: await (0, project_package_bucket_1.getBucketName)(),
      Key: `${projectId}/${packageId}/package.json`,
      Body: JSON.stringify(packageData, null, 2),
    }),
  );
  await packageBucket.send(
    new client_s3_1.PutObjectCommand({
      Bucket: await (0, project_package_bucket_1.getBucketName)(),
      Key: `${projectId}/${packageId}/package.zip`,
      Body: fs_1.default.createReadStream(zipPath),
    }),
  );
  await (0, utils_sh_1.rmSafe)(path);
};
const postPackageHandler = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userToken } = req.cookies;
    const { body: projectData } = req;
    const packageId = (0, uuid_1.v4)();
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
exports.postPackageHandler = postPackageHandler;
const putPackageHandler = async (req, res) => {
  try {
    const { projectId, packageId } = req.params;
    const { userToken } = req.cookies;
    const { body: projectData } = req;
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
exports.putPackageHandler = putPackageHandler;
const getPackageHandler = async (req, res) => {
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
    const repo = await (0, project_repository_1.connectProjectRepository)();
    const project = await repo.readProjectConfiguration(projectId);
    if (!project) {
      res.status(404).json({ errorMessage: 'Project does not exist' });
      return;
    }
    if ((project === null || project === void 0 ? void 0 : project.owner) !== userToken) {
      res.status(404).json({ errorMessage: 'Not authorised' });
      return;
    }
    // Check payment processed
    const sessionRepo = await (0, session_repository_1.connectSessionRepository)();
    const sessionData = await sessionRepo.readSession(userToken);
    if (!sessionData) {
      console.error('Cannot retrieve session data for', userToken);
      res.status(500).json({ errorMessage: `Cannot retrieve session data ${userToken}` });
      return;
    }
    // If no payment has been processed, do not return download URL
    if (
      !(
        (sessionData === null || sessionData === void 0 ? void 0 : sessionData.coupon) ||
        (sessionData === null || sessionData === void 0 ? void 0 : sessionData.stripeId)
      )
    ) {
      res.status(200).json({
        error: 'not-paid',
        stripeId: sessionData.stripeId,
      });
      return;
    }
    if (!(sessionData === null || sessionData === void 0 ? void 0 : sessionData.coupon)) {
      (0, assert_1.default)(sessionData.stripeId, 'Session data stripe id not defined.');
      const paid = await (0, stripe_1.isSessionPaid)({ sessionId: sessionData.stripeId });
      if (!paid) {
        res.status(200).json({
          error: 'not-paid',
          stripeId: sessionData.stripeId,
        });
        return;
      }
    }
    // generate download URL
    const packageBucket = await (0, project_package_bucket_1.connect)();
    const bucketName = await (0, project_package_bucket_1.getBucketName)();
    const downloadUrl = await (0, project_package_bucket_1.getSignedUrl)(
      packageBucket,
      new client_s3_1.GetObjectCommand({
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
exports.getPackageHandler = getPackageHandler;
router.post('/', exports.postPackageHandler);
router.get('/:packageId', exports.getPackageHandler);
router.put('/:packageId', exports.putPackageHandler);
exports.default = router;
//# sourceMappingURL=packages.js.map
