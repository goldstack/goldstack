#!/usr/bin/env node
import { getDeploymentConfig } from '@goldstack/template-static-website-aws';
import { sh } from '@goldstack/utils-sh';

const build = async (args: string[]): Promise<void> => {
  // The config for a selected deployment
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const deploymentConfig = getDeploymentConfig(args[2]);

  const sourceDir = './web';
  const destDir = './webDist';

  // Your logic for custom builds here
  sh.mkdir('-p', destDir);
  sh.cp('-ru', sourceDir + '/*', destDir);
};

build(process.argv);
