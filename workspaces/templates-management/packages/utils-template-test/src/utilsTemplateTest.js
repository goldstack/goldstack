'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.assertFilesDoNotExist =
  exports.assertFilesExist =
  exports.buildTemplate =
  exports.getTemplateTest =
  exports.getTemplateTests =
  exports.prepareLocalS3Repo =
    void 0;
const template_build_1 = require('@goldstack/template-build');
const template_repository_1 = require('@goldstack/template-repository');
const utils_sh_1 = require('@goldstack/utils-sh');
const assert_1 = require('assert');
const fs_1 = __importDefault(require('fs'));
const mock_aws_s3_v3_1 = require('mock-aws-s3-v3');
const path_1 = require('path');
const util_1 = require('util');
const AssertApplicationTest_1 = require('./tests/AssertApplicationTest');
const AssertPackageFilesTest_1 = require('./tests/AssertPackageFilesTest');
const AssertRestApiTest_1 = require('./tests/AssertRestApiTest');
const AssertRootFilesTest_1 = require('./tests/AssertRootFilesTest');
const AssertStaticWebsiteAwsDeploymentsTest_1 = require('./tests/AssertStaticWebsiteAwsDeploymentsTest');
const AssertWebsiteTest_1 = require('./tests/AssertWebsiteTest');
const DeployTest_1 = require('./tests/DeployTest');
const DestroyStateBucketTest_1 = require('./tests/DestroyStateBucketTest');
const EnsureBabelRcDoesNotExist_1 = require('./tests/EnsureBabelRcDoesNotExist');
const IgnoreMissingDeploymentsTest_1 = require('./tests/IgnoreMissingDeploymentsTest');
const InfraDestroyTest_1 = require('./tests/InfraDestroyTest');
const InfraPlanTest_1 = require('./tests/InfraPlanTest');
const InfraUpTest_1 = require('./tests/InfraUpTest');
const PackageBuildLambdaTest_1 = require('./tests/PackageBuildLambdaTest');
const PackageBuildTest_1 = require('./tests/PackageBuildTest');
const PackageTestTest_1 = require('./tests/PackageTestTest');
const PrintDirectoryContentTest_1 = require('./tests/PrintDirectoryContentTest');
const RootBuildTest_1 = require('./tests/RootBuildTest');
function assert(condition, msg) {
  if (!condition) {
    throw new assert_1.AssertionError({ message: msg });
  }
}
const sleep = (0, util_1.promisify)(setTimeout);
const prepareLocalS3Repo = async (goldstackTestsDir) => {
  await (0, utils_sh_1.rmSafe)(goldstackTestsDir);
  // Addressing issue in windows that there is a file error when creating right after deleting
  await sleep(100);
  (0, utils_sh_1.mkdir)('-p', goldstackTestsDir);
  (0, utils_sh_1.mkdir)('-p', (0, path_1.join)(goldstackTestsDir, 's3/repo'));
  (0, utils_sh_1.mkdir)('-p', (0, path_1.join)(goldstackTestsDir, 'templates/'));
  const s3 = (0, mock_aws_s3_v3_1.createS3Client)({
    localDirectory: (0, path_1.join)(goldstackTestsDir, 's3/repo'),
    bucket: 'local-dummy-template-repo',
  });
  const repo = new template_repository_1.S3TemplateRepository({
    s3: s3,
    bucket: 'local-dummy-template-repo',
    workDir: (0, path_1.join)(goldstackTestsDir, 'templateBuildRepo'),
    bucketUrl: 'https://local.goldstack.party/repo/',
  });
  return repo;
};
exports.prepareLocalS3Repo = prepareLocalS3Repo;
const getTemplateTests = () => {
  return [
    new AssertPackageFilesTest_1.AssertPackageFilesTest(),
    new RootBuildTest_1.RootBuildTest(),
    new PackageBuildTest_1.PackageBuildTest(),
    new PackageTestTest_1.PackageTestTest(),
    new PackageBuildLambdaTest_1.PackageBuildLambdaTest(),
    new PrintDirectoryContentTest_1.PrintDirectoryContentTest(),
    new AssertRootFilesTest_1.AssertRootFilesTest(),
    new InfraUpTest_1.InfraUpTest(),
    new InfraPlanTest_1.InfraPlanTest(),
    new DestroyStateBucketTest_1.DestroyStateBucketTest(),
    new InfraDestroyTest_1.InfraDestroyTest(),
    new DeployTest_1.DeployTest(),
    new AssertStaticWebsiteAwsDeploymentsTest_1.AssertStaticWebsiteAwsDeploymentsTest(),
    new AssertRestApiTest_1.AssertRestApiTest(),
    new AssertApplicationTest_1.AssertApplicationTest(),
    new AssertWebsiteTest_1.AssertWebsiteTest(),
    new EnsureBabelRcDoesNotExist_1.EnsureBabelRcDoesNotExist(),
    new IgnoreMissingDeploymentsTest_1.IgnoreMissingDeploymentsTest(),
  ];
};
exports.getTemplateTests = getTemplateTests;
const getTemplateTest = (templateTestName) => {
  const tests = (0, exports.getTemplateTests)();
  const test = tests.find((templateTest) => templateTest.getName() === templateTestName);
  if (!test) {
    throw new Error(`Cannot find test definition for ${templateTestName}`);
  }
  return test;
};
exports.getTemplateTest = getTemplateTest;
const buildTemplate = async (params) => {
  if (!params.repo) throw new Error('Invalid test state.');
  const newVersion = await (0, template_build_1.build)(params.templateName, {
    monorepoRoot: (0, path_1.resolve)('./../../../../'),
    destinationDirectory: (0, path_1.resolve)(
      (0, path_1.join)(params.goldstackTestsDir, 'templates/'),
    ),
    templateRepository: params.repo,
  });
  const config = await params.repo.getLatestTemplateVersion(params.templateName);
  if (!config) {
    throw new Error(`Cannot read template configuration for ${params.templateName}`);
  }
  assert(config.templateName === params.templateName);
  assert(config.templateDocumentation.length > 10);
  (0, utils_sh_1.mkdir)('-p', './goldstackLocal/work/templates');
  const path = await params.repo.downloadTemplateArchive(
    config.templateName,
    newVersion.templateVersion,
    './goldstackLocal/work/templates/',
  );
  if (!path) {
    throw new Error('Archive could not be downloaded');
  }
  assert(fs_1.default.existsSync(path));
  const archiveSize = fs_1.default.statSync(path).size > 1000;
  assert(
    archiveSize,
    `Resulting archive for template build too small. Archive ${path} has size ${archiveSize}`,
  );
  await (0, utils_sh_1.rmSafe)('./goldstackLocal/work/templates');
};
exports.buildTemplate = buildTemplate;
const assertFilesExist = (files) => {
  for (const file of files) {
    if (!fs_1.default.existsSync(file)) {
      throw new assert_1.AssertionError({
        message: `Expected file ${file} does not exist.`,
      });
    }
  }
};
exports.assertFilesExist = assertFilesExist;
const assertFilesDoNotExist = (files) => {
  for (const file of files) {
    if (fs_1.default.existsSync(file)) {
      throw new assert_1.AssertionError({
        message: `Expected file ${file} to not exist.`,
      });
    }
  }
};
exports.assertFilesDoNotExist = assertFilesDoNotExist;
//# sourceMappingURL=utilsTemplateTest.js.map
