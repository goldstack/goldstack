import { pnpPlugin } from '@yarnpkg/esbuild-plugin-pnp';
import { build } from 'esbuild';
import { writeFileSync } from 'fs';

build({
  plugins: [pnpPlugin()],
  bundle: true,
  entryPoints: ['src/lambda.ts'],
  external: ['mock-aws-s3-v3', 'testcontainers', 'aws-sdk-client-mock'], // mock-aws-s3 from s3 template, testcontainers from dynamodb template],
  minify: true,
  format: 'cjs',
  platform: 'node',
  treeShaking: true,
  target: 'node18.0',
  sourcemap: true,
  metafile: true,
  outfile: 'distLambda/lambda.js',
})
  .catch((e) => {
    console.log('Build not successful', e.message);
    process.exit(1);
  })
  .then(async (result) => {
    writeFileSync('distLambda/meta.json', JSON.stringify(result.metafile));
    // console.log(await analyzeMetafile(result.metafile));
  });
