import { wrapCli } from '@goldstack/utils-cli';
import yargs from 'yargs';
import { GitHubActionsAgent } from './githubActionsAgent';

// Cast yargs to any to avoid type issues with demandCommand
const yargsAny = yargs as any;

import { info } from '@goldstack/utils-log';
import { config } from 'dotenv';

const envFile = process.env.ENV_FILE || '.env';
config({ path: envFile });

export const run = async (): Promise<void> => {
  await wrapCli(async (): Promise<void> => {
    const argv = await yargsAny
      .demandCommand(1)
      .usage('Usage: $0 <command> [options]')
      .command('identify-comment', 'Identify issue and PR numbers from a comment', (yargs) => {
        return yargs
          .option('comment', {
            type: 'string',
            describe: 'The full comment body',
            demandOption: true,
          })
          .option('issue-number', {
            type: 'number',
            describe: 'The issue/PR number from the event',
            demandOption: true,
          });
      })
      .command(
        'identify-branch',
        'Identify the working branch based on issue/PR context',
        (yargs) => {
          return yargs
            .option('issue-number', {
              type: 'number',
              describe: 'Issue number',
              demandOption: true,
            })
            .option('pr-number', {
              type: 'number',
              describe: 'PR number (optional)',
              demandOption: false,
            });
        },
      )
      .command('checkout-branch', 'Checkout the appropriate working branch', (yargs) => {
        return yargs
          .option('branch-name', {
            type: 'string',
            describe: 'Branch name to checkout',
            demandOption: true,
          })
          .option('pr-number', {
            type: 'number',
            describe: 'PR number (optional)',
            demandOption: false,
          });
      })
      .command(
        'build-context',
        'Build comprehensive task context from issue/PR and comments',
        (yargs) => {
          return yargs
            .option('comment', {
              type: 'string',
              describe: 'The user command comment',
              demandOption: true,
            })
            .option('issue-number', {
              type: 'number',
              describe: 'Issue number',
              demandOption: true,
            })
            .option('pr-number', {
              type: 'number',
              describe: 'PR number (optional)',
              demandOption: false,
            })
            .option('agents-file', {
              type: 'string',
              describe: 'Path to AGENTS file',
              demandOption: false,
              default: 'AGENTS_GHA.md',
            });
        },
      )
      .command('post-start', 'Post a started working comment to issue or PR', (yargs) => {
        return yargs
          .option('issue-number', {
            type: 'number',
            describe: 'Issue number',
            demandOption: true,
          })
          .option('pr-number', {
            type: 'number',
            describe: 'PR number (optional)',
            demandOption: false,
          })
          .option('branch-name', {
            type: 'string',
            describe: 'Branch name',
            demandOption: true,
          })
          .option('run-url', {
            type: 'string',
            describe: 'Workflow run URL',
            demandOption: true,
          });
      })
      .command(
        'fix-pr-body',
        'Fix literal \\\\n strings in PR body to actual newlines',
        (yargs) => {
          return yargs.option('pr-number', {
            type: 'number',
            describe: 'PR number',
            demandOption: true,
          });
        },
      )
      .command('create-pr', 'Create a draft PR from the current branch', (yargs) => {
        return yargs
          .option('issue-number', {
            type: 'number',
            describe: 'Issue number',
            demandOption: true,
          })
          .option('branch-name', {
            type: 'string',
            describe: 'Branch name',
            demandOption: true,
          });
      })
      .command('run-kilocode', 'Execute the Kilo Code agent with task context', (yargs) => {
        return yargs
          .option('task', {
            type: 'string',
            describe: 'Task context',
            demandOption: true,
          })
          .option('auto', {
            type: 'boolean',
            describe: 'Run in auto mode',
            demandOption: false,
            default: true,
          })
          .option('timeout', {
            type: 'number',
            describe: 'Timeout in seconds',
            demandOption: false,
            default: 2000,
          })
          .option('model', {
            type: 'string',
            describe: 'LLM model to use',
            demandOption: false,
          });
      })
      .command('run-all', 'Execute the complete workflow as a single command', (yargs) => {
        return yargs
          .option('comment', {
            type: 'string',
            describe: 'The command comment',
            demandOption: true,
          })
          .option('issue-number', {
            type: 'number',
            describe: 'Issue number from event',
            demandOption: true,
          })
          .option('auto', {
            type: 'boolean',
            describe: 'Run in auto mode',
            demandOption: false,
            default: true,
          })
          .option('timeout', {
            type: 'number',
            describe: 'Timeout in seconds',
            demandOption: false,
            default: 2000,
          });
      })
      .parse();

    // Get environment variables
    const token = process.env.GITHUB_TOKEN;
    const kiloApiKey = process.env.KILOCODE_API_KEY;

    if (!token || !kiloApiKey) {
      throw new Error('GITHUB_TOKEN and KILOCODE_API_KEY environment variables are required');
    }

    const agent = new GitHubActionsAgent({ token, kiloApiKey });

    info(`Starting GitHub Actions Agent with command: ${argv._[0]}`);

    // Handle commands
    if (argv._[0] === 'identify-comment') {
      const result = await agent.identifyComment({
        comment: String(argv.comment),
        issueNumber: Number(argv.issueNumber),
      });
      console.log(JSON.stringify(result));
      return;
    }

    if (argv._[0] === 'identify-branch') {
      const result = await agent.identifyBranch({
        issueNumber: Number(argv.issueNumber),
        prNumber: argv.prNumber ? Number(argv.prNumber) : undefined,
      });
      console.log(JSON.stringify(result));
      return;
    }

    if (argv._[0] === 'checkout-branch') {
      await agent.checkoutBranch({
        branchName: String(argv.branchName),
        prNumber: argv.prNumber ? Number(argv.prNumber) : undefined,
      });
      console.log('Branch checked out successfully');
      return;
    }

    if (argv._[0] === 'build-context') {
      const result = await agent.buildContext({
        comment: String(argv.comment),
        issueNumber: Number(argv.issueNumber),
        prNumber: argv.prNumber ? Number(argv.prNumber) : undefined,
        agentsFile: argv.agentsFile ? String(argv.agentsFile) : undefined,
      });
      console.log(JSON.stringify(result));
      return;
    }

    if (argv._[0] === 'post-start') {
      await agent.postStartComment({
        issueNumber: Number(argv.issueNumber),
        prNumber: argv.prNumber ? Number(argv.prNumber) : undefined,
        branchName: String(argv.branchName),
        runUrl: String(argv.runUrl),
      });
      console.log('Start comment posted successfully');
      return;
    }

    if (argv._[0] === 'fix-pr-body') {
      await agent.fixPrBody({
        prNumber: Number(argv.prNumber),
      });
      console.log('PR body fixed successfully');
      return;
    }

    if (argv._[0] === 'create-pr') {
      const result = await agent.createPr({
        issueNumber: Number(argv.issueNumber),
        branchName: String(argv.branchName),
      });
      console.log(JSON.stringify(result));
      return;
    }

    if (argv._[0] === 'run-kilocode') {
      await agent.runKilocode({
        task: String(argv.task),
        auto: argv.auto as boolean | undefined,
        timeout: argv.timeout as number | undefined,
        model: argv.model ? String(argv.model) : undefined,
      });
      return;
    }

    if (argv._[0] === 'run-all') {
      await agent.runAll({
        comment: String(argv.comment),
        issueNumber: Number(argv.issueNumber),
        auto: argv.auto as boolean | undefined,
        timeout: argv.timeout as number | undefined,
      });
      return;
    }

    throw new Error(`Unknown command: ${argv._[0]}`);
  });
};
