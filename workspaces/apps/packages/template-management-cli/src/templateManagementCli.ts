import { SendEmailCommand } from '@aws-sdk/client-ses';
import { connect as connectSes, getFromDomain } from '@goldstack/goldstack-email-send';
import type { AWSAPIKeyUser } from '@goldstack/infra-aws';
import { readConfig } from '@goldstack/infra-aws';
import { buildSet } from '@goldstack/template-build-set';
import { getAllBuildSets, getBuildSet } from '@goldstack/template-metadata';
import { S3TemplateRepository } from '@goldstack/template-repository';
import { connect, getBucketName } from '@goldstack/template-repository-bucket';
import { wrapCli } from '@goldstack/utils-cli';
import { getAwsConfigPath } from '@goldstack/utils-config';
import { info } from '@goldstack/utils-log';
import { mkdir, rm } from '@goldstack/utils-sh';
import assert from 'assert';
import fs from 'fs';
import { createS3Client, resetMocks } from 'mock-aws-s3-v3';
import { join, resolve } from 'path';
import tmp from 'tmp';
import yargs from 'yargs';
import { type ScheduleArgs, scheduleAllDeploySets } from './scheduleAllDeploySets';

export const run = async (): Promise<void> => {
  await wrapCli(async (): Promise<void> => {
    const argv = await yargs
      .demandCommand(1)
      .usage('Usage: $0 <command> [options]')
      .command('deploy-set', 'Deploys a package set', {
        set: {
          describe: 'Set that should be deployed',
          choices: (await getAllBuildSets()).map((set) => set.buildSetName),
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

    let workDir = argv.workDir as string;
    let tmpInstance: tmp.DirResult | undefined;
    if (workDir === 'tmp') {
      tmpInstance = tmp.dirSync();
      workDir = `${tmpInstance.name}/`;
      info(`Creating in temporary directory ${workDir}`);
    } else {
      rm('-rf', workDir);
      mkdir('-p', workDir);
    }
    if (!workDir.endsWith('/')) {
      throw new Error(
        `Working directory must end with a /. Supplied working directory: ${workDir}`,
      );
    }
    let repo: S3TemplateRepository | undefined;
    if (argv.repo === 'goldstack-dev') {
      const s3 = await connect('dev');
      const bucketName = await getBucketName('dev');
      info(`Connected to S3 repository dev and bucket: ${bucketName}`);
      repo = new S3TemplateRepository({
        s3,
        bucket: bucketName,
        bucketUrl: 'https://repo.dev.goldstack.party/',
        workDir: join(workDir, 'dev-templates-build/'),
      });
    }
    if (argv.repo === 'goldstack-prod') {
      const s3 = await connect('prod');
      const bucketName = await getBucketName('prod');
      repo = new S3TemplateRepository({
        s3,
        bucket: bucketName,
        bucketUrl: 'https://repo.goldstack.party/repo',
        workDir: join(workDir, 'prod-templates-build/'),
      });
    }

    if (argv.repo === 'dummy') {
      const s3 = createS3Client({
        localDirectory: join(workDir, 'dummy-template-repo'),
        bucket: 'local-dummy-template-repository',
      });
      repo = new S3TemplateRepository({
        s3: s3,
        bucket: 'local-dummy-template-repository',
        bucketUrl: 'https://local.goldstack.party/repo/',
        workDir: join(workDir, 'dummy-templates-build/'),
      });
    } else {
      resetMocks(); // important since otherwise local mock will be used even if not specified for this run
    }

    const command = argv._[0];
    if (command === 'deploy-set') {
      assert(repo, `Repo could not be loaded from option ${argv.repo}`);

      const config = await getBuildSet(argv.set as string);

      const workDirBuild = resolve(join(workDir, 'build/'));

      rm('-rf', workDirBuild);
      mkdir('-p', workDirBuild);
      assert(
        fs.readdirSync(workDirBuild).length === 0,
        `Working directory ${workDirBuild} is not empty`,
      );

      const awsConfigPath = getAwsConfigPath('./../../');
      let awsConfig: undefined | AWSAPIKeyUser;
      if (fs.existsSync(awsConfigPath)) {
        info('Using local AWS config');
        const goldstackDevUser = readConfig(awsConfigPath).users.find(
          (user) => user.name === 'goldstack-dev',
        );
        assert(goldstackDevUser, 'No goldstack-dev user defined in config');
        awsConfig = goldstackDevUser.config as AWSAPIKeyUser;
      }

      const res = await buildSet({
        s3repo: repo,
        workDir: workDirBuild,
        config,
        skipTests: argv.skipTests === 'true',
        deployBeforeTest: argv.deployBeforeTest === 'true',
        user: awsConfig,
      });

      info('Deploy set completed.');
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

        process.env.GOLDSTACK_DEPLOYMENT = argv.deployment as string;
        const ses = await connectSes(argv.deployment as string);

        await ses.send(
          new SendEmailCommand({
            Destination: {
              ToAddresses: [(argv.emailResultsTo as string) || 'invalid'],
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
            Source: `"Goldstack" <no-reply@${await getFromDomain()}>`,
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
      await scheduleAllDeploySets(argv as unknown as ScheduleArgs);
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