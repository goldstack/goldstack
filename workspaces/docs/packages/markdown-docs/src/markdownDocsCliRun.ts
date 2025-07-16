import { wrapCli } from '@goldstack/utils-cli';
import yargs from 'yargs';

import { generateDocs } from './generateDocs';

export const run = async (): Promise<void> => {
  await wrapCli(async (): Promise<any> => {
    const argv = await yargs
      .demandCommand(1)
      .usage('Usage: $0 <command> [options]')
      .command(
        'generate-docs <source> <destination>',
        'Generate HTML documentation data based on Markdown',
        (yargs) => {
          return yargs
            .positional('source', {
              describe: 'A directory from where Markdown and navigation files should be loaded',
              type: 'string',
              demandOption: true,
            })
            .positional('destination', {
              describe: 'A directory where the generated data should be stored',
              type: 'string',
              demandOption: true,
            });
        },
      )
      .parse();

    if (argv._[0] === 'generate-docs') {
      await generateDocs({
        source: argv.source as any,
        destination: argv.destination as any,
      });
      return;
    }

    throw new Error('Unknown command: ' + argv._[0]);
  });
};
