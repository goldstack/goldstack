import { wrapCli } from '@goldstack/utils-cli';
import { buildSet } from '@goldstack/template-build-set';
import { connect, getBucketName } from '@goldstack/template-repository-bucket';
import { mkdir, rm } from '@goldstack/utils-sh';
import tmp from 'tmp';
import { S3TemplateRepository } from '@goldstack/template-repository';
import yargs from 'yargs';
import assert from 'assert';
import { getBuildSet } from './deploySets/deploySets';
import AWSMock from 'mock-aws-s3';
import { getAwsConfigPath } from '@goldstack/utils-config';
import { readConfig } from '@goldstack/infra-aws';
import { scheduleAllDeploySets } from './scheduleAllDeploySets';
import fs from 'fs';
import { AWSAPIKeyUserConfig } from '../../../../templates-lib/packages/infra-aws/dist/types/awsAccount';
import path from 'path';

export const run = async (): Promise<void> => {
  await wrapCli(
    async (): Promise<any> => {
      const argv = yargs
        .demandCommand(1)
        .usage('Usage: $0 <command> [options]')
        .command('deploy-set', 'Deploys a package set', {
          set: {
            describe: 'Set that should be deployed',
            choices: ['backend', 'static-website'],
            required: true,
          },
          repo: {
            describe: 'The target S3 repo to use',
            choices: ['dummy', 'goldstack-dev', 'goldstack-prod'],
            required: true,
          },
          workDir: {
            describe: 'The local directory where temporary files are stored',
            default: './goldstackWork/',
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
          s3,
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
        let awsConfig: undefined | AWSAPIKeyUserConfig = undefined;
        console.log(path.resolve(awsConfigPath));
        if (fs.existsSync(awsConfigPath)) {
          console.info('Using local AWS config');
          const goldstackDevUser = readConfig(awsConfigPath).users.find(
            (user) => user.name === 'goldstack-dev'
          );
          assert(goldstackDevUser, 'No goldstack-dev user defined in config');
          awsConfig = goldstackDevUser.config as AWSAPIKeyUserConfig;
        }

        await buildSet({
          s3repo: repo,
          workDir: workDir,
          config,
          skipTests: argv.skipTests && argv.skipTests === 'true',
          user: awsConfig,
        });
        console.log('Deploy set completed.');
        if (tmpInstance) {
          tmpInstance.removeCallback();
        }
        return;
      }

      if (command === 'schedule-all-deploy-sets') {
        await scheduleAllDeploySets(argv);
        console.log('Schedule all deploy sets completed');
        return;
      }

      throw new Error(`Command not handled: ${command}`);
    }
  );
};
