import { build } from 'esbuild';
import { pnpPlugin } from '@yarnpkg/esbuild-plugin-pnp';

build({
  plugins: [pnpPlugin()],
  bundle: true,
  entryPoints: ['src/root.ts'],
  external: ['aws-sdk'],
  minify: true,
  format: 'cjs',
  target: 'node12.0',
  sourcemap: true,
  outfile: 'distLambda/root.js',
}).catch((e) => {
  console.log('Build not successful', e.message);
  process.exit(1);
});
