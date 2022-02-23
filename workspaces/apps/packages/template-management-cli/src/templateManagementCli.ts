import { wrapCli } from '@goldstack/utils-cli';
import { buildSet } from '@goldstack/template-build-set';
import { connect, getBucketName } from '@goldstack/template-repository-bucket';
import { mkdir, rm } from '@goldstack/utils-sh';
import tmp from 'tmp';
import { S3TemplateRepository } from '@goldstack/template-repository';
import yargs from 'yargs';
import assert from 'assert';
import { getAllBuildSets, getBuildSet } from '@goldstack/template-metadata';
import AWSMock from 'mock-aws-s3';
import { getAwsConfigPath } from '@goldstack/utils-config';
import { readConfig } from '@goldstack/infra-aws';
import { scheduleAllDeploySets } from './scheduleAllDeploySets';
import fs from 'fs';
import { AWSAPIKeyUser } from '@goldstack/infra-aws';
import {
  connect as connectSes,
  getFromDomain,
} from '@goldstack/goldstack-email-send';

export const run = async (): Promise<void> => {
  await wrapCli(
    async (): Promise<any> => {
      const argv = yargs
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
            describe:
              'Provide an email address that test results will be sent to',
            required: false,
          },
          skipTests: {
            describe: 'Skip running tests',
            type: 'string',
            choices: ['true', 'false'],
            required: false,
          },
        })
        .command(
          'schedule-all-deploy-sets',
          'Creates tasks for all default deploy-sets',
          {
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
          }
        ).argv;

      let repo: S3TemplateRepository | undefined = undefined;
      if (argv.repo === 'goldstack-dev') {
        const s3 = await connect('dev');
        const bucketName = await getBucketName('dev');
        repo = new S3TemplateRepository({
          s3,
          bucket: bucketName,
          bucketUrl: 'https://repo.dev.goldstack.party/',
        });
      }
      if (argv.repo === 'goldstack-prod') {
        const s3 = await connect('prod');
        const bucketName = await getBucketName('prod');
        repo = new S3TemplateRepository({
          s3,
          bucket: bucketName,
          bucketUrl: 'https://repo.goldstack.party/repo',
        });
      }

      if (argv.repo === 'dummy') {
        AWSMock.config.basePath = 'goldstackLocal/s3';
        const s3: AWSMock.S3 = new AWSMock.S3({
          params: {},
        });
        repo = new S3TemplateRepository({
          s3: s3 as any,
          bucket: 'repo',
          bucketUrl: 'https://local.goldstack.party/repo/',
        });
      }

      const command = argv._[0];
      if (command === 'deploy-set') {
        assert(repo, `Repo could not be loaded from option ${argv.repo}`);

        const config = await getBuildSet(argv.set as string);
        let workDir = argv.workDir as string;
        let tmpInstance: any = undefined;
        if (workDir === 'tmp') {
          tmpInstance = tmp.dirSync();
          workDir = tmpInstance.name + '/';
          console.log('Creating in temporary directory ' + workDir);
        }
        if (!workDir.endsWith('/')) {
          throw new Error(
            `Working directory must end with a /. Supplied working directory: ${workDir}`
          );
        }
        rm('-rf', workDir);
        mkdir('-p', workDir);

        const awsConfigPath = getAwsConfigPath('./../../');
        let awsConfig: undefined | AWSAPIKeyUser = undefined;
        if (fs.existsSync(awsConfigPath)) {
          console.info('Using local AWS config');
          const goldstackDevUser = readConfig(awsConfigPath).users.find(
            (user) => user.name === 'goldstack-dev'
          );
          assert(goldstackDevUser, 'No goldstack-dev user defined in config');
          awsConfig = goldstackDevUser.config as AWSAPIKeyUser;
        }

        const res = await buildSet({
          s3repo: repo,
          workDir: workDir,
          config,
          skipTests: argv.skipTests ? argv.skipTests === 'true' : false,
          user: awsConfig,
        });

        console.log('Deploy set completed.');
        if (tmpInstance) {
          rm('-rf', workDir + '*');
          tmpInstance.removeCallback();
        }

        if (argv.emailResultsTo && argv.emailResultsTo !== 'false') {
          if (!argv.deployment) {
            console.error(
              'Cannot email results. Argument --deployment not defined.'
            );
            return;
          }
          console.log(
            'Sending email with results to',
            argv.emailResultsTo,
            'in deployment ',
            argv.deployment
          );

          process.env.GOLDSTACK_DEPLOYMENT = argv.deployment as string;
          const ses = await connectSes(argv.deployment as string);

          await ses
            .sendEmail({
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
                    Data:
                      'Test Results:\n' + res.testResultsText ||
                      'No results available',
                  },
                },
              },
              Source: '"Goldstack" <no-reply@' + (await getFromDomain()) + '>',
            })
            .promise();
        }

        if (
          res.testResults &&
          res.testResults.find((tr) => !tr.result) !== undefined
        ) {
          throw new Error('Build set not built successfully.');
        }

        return;
      }

      if (command === 'schedule-all-deploy-sets') {
        console.log('Schedule all deploy sets');
        await scheduleAllDeploySets(argv);
        console.log('Schedule all deploy sets completed');
        return;
      }

      throw new Error(`Command not handled: ${command}`);
    }
  );
};
