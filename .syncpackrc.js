// @ts-check

/** @type {import("syncpack").RcFile} */
const config = {
  source: [
    'package.json',
    'workspaces/*/package.json',
    'workspaces/*/packages/*/package.json',
  ],
  specifierTypes: ['**'],
  versionGroups: [
    {
      dependencies: ['next'],
      packages: [
        '@goldstack/goldstack-home',
        '@goldstack/docs-main',
        '@goldstack/server-side-rendering',
        '@goldstack/template-ssr',
        '@goldstack/template-ssr-server',
        '@goldstack/template-ssr-server-compile-bundle',
        '@goldstack/utils-track',
        'apps',
        'docs',
        'examples',
        'templates',
        'templates-lib',
        'templates-management',
        'utils',
      ],
      pinVersion: '13.5.1',
    },
    {
      dependencies: ['react', 'react-dom'],
      packages: [
        '@goldstack/goldstack-home',
        '@goldstack/docs-main',
        '@goldstack/server-side-rendering',
        '@goldstack/template-ssr',
        '@goldstack/template-ssr-server',
        '@goldstack/template-ssr-server-compile-bundle',
        '@goldstack/utils-track',
        'apps',
        'docs',
        'examples',
        'templates',
        'templates-lib',
        'templates-management',
        'utils',
      ],
      pinVersion: '18.2.0',
    },
    {
      dependencies: ['react-bootstrap'],
      packages: [
        '@goldstack/goldstack-home',
        '@goldstack/docs-main'
      ],
      pinVersion: '^1.6.1',
    },
    {
      dependencies: ['next'],
      packages: ['@goldstack/nextjs', '@goldstack/app-nextjs'],
      pinVersion: '^14',
    },
    {
      dependencies: ['react', 'react-dom'],
      packages: ['@goldstack/nextjs', '@goldstack/app-nextjs'],
      pinVersion: '^19',
    },
    {
      dependencies: ['eslint-config-next'],
      packages: ['@goldstack/nextjs', '@goldstack/app-nextjs'],
      pinVersion: 'next-14',
    },
  ],
};

module.exports = config;
