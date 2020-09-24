import { wrapCli } from '@goldstack/utils-cli';
import { buildSet } from '@goldstack/template-build-set';
import { connect, getBucketName } from '@goldstack/template-repository-bucket';
import { mkdir, rm } from '@goldstack/utils-sh';
import { S3TemplateRepository } from '@goldstack/template-repository';
import yargs from 'yargs';
import assert from 'assert';
import { getBuildSet } from './deploySets/deploySets';
import AWSMock from 'mock-aws-s3';

import { scheduleAllDeploySets } from './scheduleAllDeploySets';

export const run = async (): Promise<void> => {
  await wrapCli(
    async (): Promise<any> => {
      const argv = yargs
        .demandCommand(1)
        .usage('Usage: $0 <command> [options]')
        .command('deploy-set', 'Deploys a package set', {
          set: {
            describe: 'Set that should be deployed',
            choices: ['s3', 'static-website'],
            required: true,
          },
          repo: {
            describe: 'The target S3 repo to use',
            choices: ['goldstack-dev', 'dummy'],
            required: true,
          },
          workDir: {
            describe: 'The local directory where temporary files are stored',
            default: './goldstackWork/',
          },
        })
        .command(
          'schedule-all-deploy-sets',
          'Creates tasks for all default deploy-sets',
          {
            repo: {
              describe: 'The target S3 repo to use',
              choices: ['goldstack-dev'],
              required: true,
            },
            deployment: {
              describe: 'The image deployment to use',
              required: true,
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
          bucketUrl: 'https://dev.localstack.party/repo',
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
        assert(repo);

        const config = await getBuildSet(argv.set as string);
        const workDir = argv.workDir as string;
        if (!workDir.endsWith('/')) {
          throw new Error(
            `Working directory must end with a /. Supplied working directory: ${workDir}`
          );
        }
        rm('-rf', workDir);
        mkdir('-p', workDir);

        await buildSet({
          s3repo: repo,
          workDir: workDir,
          config,
        });
        console.log('Deploy set completed.');
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
