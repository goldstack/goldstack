import esbuild from 'esbuild';
import child_process from 'child_process';
import { pnpPlugin } from '@yarnpkg/esbuild-plugin-pnp';
import cssModulesPlugin from 'esbuild-css-modules-plugin';

let childProcess: child_process.ChildProcess | undefined = undefined;
let buildResult: esbuild.BuildResult | undefined = undefined;

esbuild
  .build({
    entryPoints: ['scripts/start.ts'],
    plugins: [pnpPlugin(), cssModulesPlugin()],
    outfile: './dist/scripts/start-bundle.js',
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node16.0',
    watch: {
      onRebuild(error, result) {
        childProcess?.kill();
        if (error) {
          console.error('Rebuild failed', error);
          return;
        }

        if (result) {
          buildResult = result;
        }
        childProcess = child_process.exec('node dist/scripts/start-bundle.js');
      },
    },
  })
  .then((result) => {
    buildResult = result;
    childProcess = child_process.exec('node dist/scripts/start-bundle.js');
  });
