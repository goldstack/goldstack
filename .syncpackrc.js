// @ts-check

/** @type {import("syncpack").RcFile} */
const config = {
  source: ['package.json', 'workspaces/*/package.json', 'workspaces/*/packages/*/package.json'],
  specifierTypes: ['**'],
  versionGroups: [],
};

module.exports = config;
