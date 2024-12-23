import { wrapCli } from '@goldstack/utils-cli';
import yargs from 'yargs';

import { write, rmSafe } from '@goldstack/utils-sh';

import { transpile, getDocsDir, resolveMarkdown } from './utilsDocsCli';
import path from 'path';

export const run = async (): Promise<void> => {
  await wrapCli(async (): Promise<any> => {
    const argv = await yargs
      .demandCommand(1)
      .usage('Usage: $0 <command> [options]')
      .command(
        'generate-doc <path>',
        'Converts a documentation page to HTML',
        (yargs) => {
          return yargs
            .option('json', {
              type: 'boolean',
              describe: 'If specified, output will be generated as JSON.',
              demandOption: false,
            })
            .positional('path', {
              describe:
                'The path in the Goldstack documentation where the page is located',
              type: 'string',
              demandOption: true,
            });
        }
      )
      .command(
        'generate-template-docs <path> <dest>',
        'Generates all documentation pages for a templates',
        (yargs) => {
          return yargs
            .positional('path', {
              describe:
                'The path in the Goldstack documentation where the documentation for the template is located',
              type: 'string',
              demandOption: true,
            })
            .positional('dest', {
              describe:
                'The path where generated documentation should be placed into.',
              type: 'string',
              demandOption: true,
            });
        }
      )
      .command(
        'generate-markdown-doc <path> <dest>',
        'Generates a Markdown file compiled from a Markdown source',
        (yargs) => {
          return yargs
            .positional('path', {
              describe:
                'The path in the Goldstack documentation where the source Markdown file is located',
              type: 'string',
              demandOption: true,
            })
            .positional('dest', {
              describe:
                'The path where generated Markdown file should be stored.',
              type: 'string',
              demandOption: true,
            });
        }
      )
      .parse();

    if (argv._[0] === 'generate-doc') {
      const docsDir = getDocsDir();
      const result = await transpile(docsDir + argv.path);
      if (!argv.json) {
        console.log(result);
      } else {
        console.log(JSON.stringify(result));
      }
      return;
    }

    if (argv._[0] === 'generate-template-docs') {
      const docsDir = getDocsDir();
      const templateDocFiles = ['index.md', 'template-configure.md'];

      for (const docFile of templateDocFiles) {
        const sourcePath = docsDir + argv.path + docFile;
        const result = await transpile(sourcePath);
        const targetFileName =
          argv.dest + path.parse(sourcePath).name + '.html';
        await rmSafe(targetFileName);
        write(result, targetFileName);
      }
      return;
    }

    if (argv._[0] === 'generate-markdown-doc') {
      // const docsDir = getDocsDir();
      const result = await resolveMarkdown(argv.path as any);
      write(result, argv.dest as any);
      return;
    }

    throw new Error('Unknown command: ' + argv._[0]);
  });
};
