'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.run = void 0;
const client_ses_1 = require('@aws-sdk/client-ses');
const goldstack_email_send_1 = require('@goldstack/goldstack-email-send');
const infra_aws_1 = require('@goldstack/infra-aws');
const template_build_set_1 = require('@goldstack/template-build-set');
const template_metadata_1 = require('@goldstack/template-metadata');
const template_repository_1 = require('@goldstack/template-repository');
const template_repository_bucket_1 = require('@goldstack/template-repository-bucket');
const utils_cli_1 = require('@goldstack/utils-cli');
const utils_config_1 = require('@goldstack/utils-config');
const utils_log_1 = require('@goldstack/utils-log');
const utils_sh_1 = require('@goldstack/utils-sh');
const assert_1 = __importDefault(require('assert'));
const fs_1 = __importDefault(require('fs'));
const mock_aws_s3_v3_1 = require('mock-aws-s3-v3');
const path_1 = require('path');
const tmp_1 = __importDefault(require('tmp'));
const yargs_1 = __importDefault(require('yargs'));
const scheduleAllDeploySets_1 = require('./scheduleAllDeploySets');
const run = async () => {
  await (0, utils_cli_1.wrapCli)(async () => {
    const argv = await yargs_1.default
      .demandCommand(1)
      .usage('Usage: $0 <command> [options]')
      .command('deploy-set', 'Deploys a package set', {
        set: {
          describe: 'Set that should be deployed',
          choices: (await (0, template_metadata_1.getAllBuildSets)()).map(
            (set) => set.buildSetName,
          ),
          required: true,
        },
        repo: {
          describe: 'The target S3 repo to use',
          choices: ['dummy', 'goldstack-dev', 'goldstack-prod'],
          required: true,
        },
        deployment: {
          describe: 'The Goldstack deployment for the image to use',
          required: true,
        },
        workDir: {
          describe: 'The local directory where temporary files are stored',
          default: './goldstackWork/',
        },
        emailResultsTo: {
          describe: 'Provide an email address that test results will be sent to',
          required: false,
        },
        skipTests: {
          describe: 'Skip running tests',
          type: 'string',
          choices: ['true', 'false'],
          required: false,
        },
        deployBeforeTest: {
          describe: 'Deploy the template before tests have completed (useful for development)',
          type: 'string',
          choices: ['true', 'false'],
          required: false,
        },
      })
      .command('schedule-all-deploy-sets', 'Creates tasks for all default deploy-sets', {
        repo: {
          describe: 'The target S3 repo to use',
          choices: ['dummy', 'goldstack-dev', 'goldstack-prod'],
          type: 'string',
          required: true,
        },
        deployment: {
          describe: 'The image deployment to use',
          type: 'string',
          required: true,
        },
        skipTests: {
          describe: 'Skip running tests',
          type: 'string',
          choices: ['true', 'false'],
          required: false,
        },
        emailResultsTo: {
          describe:
            'Provide an email address that test results will be sent to. Provide "false" when no email should be sent',
          type: 'string',
          default: 'false',
          required: false,
        },
      })
      .parse();
    let workDir = argv.workDir;
    let tmpInstance;
    if (workDir === 'tmp') {
      tmpInstance = tmp_1.default.dirSync({ unsafeCleanup: true });
      workDir = `${tmpInstance.name}/`;
      (0, utils_log_1.info)(`Creating in temporary directory ${workDir}`);
    } else {
      (0, utils_sh_1.rm)('-rf', workDir);
      (0, utils_sh_1.mkdir)('-p', workDir);
    }
    if (!workDir.endsWith('/')) {
      throw new Error(
        `Working directory must end with a /. Supplied working directory: ${workDir}`,
      );
    }
    let repo;
    if (argv.repo === 'goldstack-dev') {
      const s3 = await (0, template_repository_bucket_1.connect)('dev');
      const bucketName = await (0, template_repository_bucket_1.getBucketName)('dev');
      (0, utils_log_1.info)(`Connected to S3 repository dev and bucket: ${bucketName}`);
      repo = new template_repository_1.S3TemplateRepository({
        s3,
        bucket: bucketName,
        bucketUrl: 'https://repo.dev.goldstack.party/',
        workDir: (0, path_1.join)(workDir, 'dev-templates-build/'),
      });
    }
    if (argv.repo === 'goldstack-prod') {
      const s3 = await (0, template_repository_bucket_1.connect)('prod');
      const bucketName = await (0, template_repository_bucket_1.getBucketName)('prod');
      repo = new template_repository_1.S3TemplateRepository({
        s3,
        bucket: bucketName,
        bucketUrl: 'https://repo.goldstack.party/repo',
        workDir: (0, path_1.join)(workDir, 'prod-templates-build/'),
      });
    }
    if (argv.repo === 'dummy') {
      const s3 = (0, mock_aws_s3_v3_1.createS3Client)({
        localDirectory: (0, path_1.join)(workDir, 'dummy-template-repo'),
        bucket: 'local-dummy-template-repository',
      });
      repo = new template_repository_1.S3TemplateRepository({
        s3: s3,
        bucket: 'local-dummy-template-repository',
        bucketUrl: 'https://local.goldstack.party/repo/',
        workDir: (0, path_1.join)(workDir, 'dummy-templates-build/'),
      });
    } else {
      (0, mock_aws_s3_v3_1.resetMocks)(); // important since otherwise local mock will be used even if not specified for this run
    }
    const command = argv._[0];
    if (command === 'deploy-set') {
      (0, assert_1.default)(repo, `Repo could not be loaded from option ${argv.repo}`);
      const config = await (0, template_metadata_1.getBuildSet)(argv.set);
      const workDirBuild = (0, path_1.resolve)((0, path_1.join)(workDir, 'build/'));
      (0, utils_sh_1.rm)('-rf', workDirBuild);
      (0, utils_sh_1.mkdir)('-p', workDirBuild);
      (0, assert_1.default)(
        fs_1.default.readdirSync(workDirBuild).length === 0,
        `Working directory ${workDirBuild} is not empty`,
      );
      const awsConfigPath = (0, utils_config_1.getAwsConfigPath)('./../../');
      let awsConfig;
      if (fs_1.default.existsSync(awsConfigPath)) {
        (0, utils_log_1.info)('Using local AWS config');
        const goldstackDevUser = (0, infra_aws_1.readConfig)(awsConfigPath).users.find(
          (user) => user.name === 'goldstack-dev',
        );
        (0, assert_1.default)(goldstackDevUser, 'No goldstack-dev user defined in config');
        awsConfig = goldstackDevUser.config;
      }
      const res = await (0, template_build_set_1.buildSet)({
        s3repo: repo,
        workDir: workDirBuild,
        config,
        skipTests: argv.skipTests === 'true',
        deployBeforeTest: argv.deployBeforeTest === 'true',
        user: awsConfig,
      });
      (0, utils_log_1.info)('Deploy set completed.');
      if (tmpInstance) {
        tmpInstance.removeCallback();
      }
      if (argv.emailResultsTo && argv.emailResultsTo !== 'false') {
        if (!argv.deployment) {
          console.error('Cannot email results. Argument --deployment not defined.');
          return;
        }
        console.log(
          'Sending email with results to',
          argv.emailResultsTo,
          'in deployment ',
          argv.deployment,
        );
        process.env.GOLDSTACK_DEPLOYMENT = argv.deployment;
        const ses = await (0, goldstack_email_send_1.connect)(argv.deployment);
        await ses.send(
          new client_ses_1.SendEmailCommand({
            Destination: {
              ToAddresses: [argv.emailResultsTo || 'invalid'],
            },
            Message: {
              Subject: {
                Charset: 'UTF-8',
                Data:
                  'Goldstack Deploy Set ' +
                  config.buildSetName +
                  ' ' +
                  (res.testFailed && !argv.skipTests
                    ? 'FAILED TESTS'
                    : res.deployed
                      ? 'SUCCESS'
                      : 'FAILED DEPLOY'),
              },
              Body: {
                Text: {
                  Charset: 'UTF-8',
                  Data: `Test Results:\n${res.testResultsText}` || 'No results available',
                },
              },
            },
            Source: `"Goldstack" <no-reply@${await ((0, goldstack_email_send_1.getFromDomain))()}>`,
          }),
        );
      }
      if (res.testResults && res.testResults.find((tr) => !tr.result) !== undefined) {
        throw new Error('Build set not built successfully.');
      }
      return;
    }
    if (command === 'schedule-all-deploy-sets') {
      console.log('Schedule all deploy sets');
      await (0, scheduleAllDeploySets_1.scheduleAllDeploySets)(argv);
      console.log('Schedule all deploy sets completed');
      if (tmpInstance) {
        tmpInstance.removeCallback();
      }
      return;
    }
    if (tmpInstance) {
      tmpInstance.removeCallback();
    }
    throw new Error(`Command not handled: ${command}`);
  });
};
exports.run = run;
//# sourceMappingURL=templateManagementCli.js.map
