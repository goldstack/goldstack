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
      dependencies: ['next'],
      packages: ['@goldstack/nextjs'],
      pinVersion: '^14',
    },
  ],
};

module.exports = config;
