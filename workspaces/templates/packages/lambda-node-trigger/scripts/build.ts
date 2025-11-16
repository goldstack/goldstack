import { pnpPlugin } from '@yarnpkg/esbuild-plugin-pnp';
import { build } from 'esbuild';

build({
  plugins: [pnpPlugin()],
  bundle: true,
  entryPoints: ['src/lambda.ts'],
  external: ['mock-aws-s3-v3', 'testcontainers', 'aws-sdk-client-mock'], // mock-aws-s3-v3 from s3 template, testcontainers from dynamodb template
  minify: true,
  format: 'cjs',
  platform: 'node',
  target: 'node18.0',
  sourcemap: true,
  outfile: 'distLambda/lambda.js',
}).catch((e) => {
  console.log('Build not successful', e.message);
  process.exit(1);
});
