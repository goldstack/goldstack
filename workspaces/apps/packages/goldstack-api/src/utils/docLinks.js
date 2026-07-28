'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.getDocLinks = void 0;
const template_repository_1 = require('@goldstack/template-repository');
const template_repository_bucket_1 = require('@goldstack/template-repository-bucket');
const utils_package_1 = require('@goldstack/utils-package');
const utils_sh_1 = require('@goldstack/utils-sh');
const path_1 = __importDefault(require('path'));
const getGoldstackJsonPaths = (workspacePath) => {
  const res = (0, utils_sh_1.globSync)(
    `${workspacePath.replace(/\\/g, '/')}packages/*/goldstack.json`,
  );
  return res;
};
const getDocLinks = async (workspacePath) => {
  const goldstackJsonPaths = getGoldstackJsonPaths(workspacePath);
  const templateRepo = new template_repository_1.S3TemplateRepository({
    s3: await (0, template_repository_bucket_1.connect)(),
    bucket: await (0, template_repository_bucket_1.getBucketName)(),
    bucketUrl: '',
    workDir: './goldstackLocal/work/repo/',
  });
  return await Promise.all(
    goldstackJsonPaths.map(async (goldstackJsonPath) => {
      const goldstackConfig = (0, utils_package_1.readPackageConfig)(
        `${path_1.default.dirname(goldstackJsonPath)}/`,
      );
      const templateJson = await templateRepo.getLatestTemplateVersion(goldstackConfig.template);
      if (!templateJson) {
        console.warn(
          'Cannot obtain documentation link. Template cannot be loaded',
          goldstackConfig.template,
        );
        return {
          packageName: goldstackConfig.name,
          link: '',
        };
      }
      if (!templateJson.templateDocumentation) {
        console.log(
          'No documentation link is defined for template:',
          templateJson.templateDocumentation,
        );
      }
      return {
        packageName: goldstackConfig.name,
        link: templateJson.templateDocumentation,
      };
    }),
  );
};
exports.getDocLinks = getDocLinks;
//# sourceMappingURL=docLinks.js.map
