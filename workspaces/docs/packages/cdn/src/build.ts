#!/usr/bin/env node
import { getDeploymentConfig } from '@goldstack/template-static-website-aws';
import { mkdir, copy } from '@goldstack/utils-sh';

const build = async (args: string[]): Promise<void> => {
  // The config for a selected deployment
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const deploymentConfig = getDeploymentConfig(args[2]);

  const sourceDir = './web';
  const destDir = './webDist/';

  // Your logic for custom builds here
  mkdir('-p', destDir);
  copy(sourceDir + '/404.html', destDir);
  copy(sourceDir + '/index.html', destDir);
  copy(sourceDir + '/img', destDir + 'img/');
};

build(process.argv);
