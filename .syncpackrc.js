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
      dependencies: ['react-bootstrap'],
      packages: ['@goldstack/goldstack-home', '@goldstack/docs-main'],
      pinVersion: '^1.6.1',
    },
    {
      dependencies: ['next', 'react', 'react-dom', 'eslint-config-next'],
      packages: ['@goldstack/nextjs'],
      pinVersion: '^14',
    },
    {

      dependencies: ['next', 'react', 'react-dom', 'eslint-config-next'],
      packages: ['@goldstack/app-nextjs'],
      pinVersion: '^14',
    },
  ],
};

module.exports = config;
