import assert from 'assert';
import path from 'path';
import fs from 'fs';
import watch from 'node-watch';
import { cd, sh, read } from '@goldstack/utils-sh';
import match from 'minimatch';
import { debug } from '@goldstack/utils-log';

export const getNearestPackageJson = (name: string): string => {
  if (fs.existsSync(name + '/package.json')) {
    return name + '/package.json';
  }
  const baseName = path.basename(name);
  if (baseName === 'package.json') {
    return name;
  }
  const dir = path.dirname(name);
  if (fs.existsSync(dir + '/package.json')) {
    return dir + '/package.json';
  }
  if (dir === path.parse(name).root) {
    throw new Error('Cannot find package json in parent directories.');
  }
  // check parent directory
  return getNearestPackageJson(path.dirname(dir));
};
const getNearestPackageFolder = (name: string): string => {
  const nearestPackageJson = getNearestPackageJson(name);
  return path.dirname(nearestPackageJson);
};

export const run = async (args: string[]): Promise<void> => {
  assert(args[2] === '--watch');
  const folder = args[3];
  assert(args[4] === '--exec');
  const [, , , , , ...commandArgs] = args;
  let command = commandArgs.join(' ');
  // removing quotation marks if present
  // eslint-disable-next-line quotes
  if (command.charAt(0) === "'" || command.charAt(0) === '"') {
    command = command.substr(1, command.length - 2);
  }

  const watchDir = path.resolve(folder);
  console.log(`Start watching ${watchDir} for running command: ${command}`);
  let failedPackages: string[] = [];

  if (!fs.existsSync('./.nodemonx.json')) {
    throw new Error('No .nodemonx.json file present');
  }
  const config = JSON.parse(read('./.nodemonx.json'));

  watch(watchDir, { recursive: true }, function (evt, name) {
    // check if in file whitelist
    if (!config.include.find((glob: string) => match(name, glob))) {
      debug('Ignoring changed file since it is not in whitelist: ' + name);
      return;
    }
    // check if in file blacklist
    if (config.exclude.find((glob: string) => match(name, glob))) {
      debug('Ignoring changed file since it is in blacklist: ' + name);
      return;
    }

    console.log(`Change detected: ${name}`);
    const packageDir = getNearestPackageFolder(name);
    console.log(`Running command in: ${packageDir} ...`);
    cd(packageDir);
    failedPackages = failedPackages.filter((pkg) => pkg !== packageDir);
    const res = sh.exec(command, { silent: false });
    if (res.code === 0) {
      console.log(`✔️ Command successfully run in ${packageDir}`);
    } else {
      console.log(
        `❌ ERROR building: ${packageDir}. Package will be rebuilt on next change.`
      );
      failedPackages.push(packageDir);
    }
    const failedPackagesToTest = failedPackages.filter(
      (pkg) => pkg !== packageDir
    );
    if (failedPackagesToTest.length > 0) {
      console.log(
        `Running command for ${failedPackagesToTest.length} previously failed packages.`
      );
      for (const failedPackage of failedPackagesToTest) {
        cd(failedPackage);
        const failRes = res.exec(command, { silent: false });
        if (failRes.code === 0) {
          failedPackages = failedPackages.filter(
            (pkg) => pkg !== failedPackage
          );
          console.log(
            `✔️ Command successfully run for previously failed package: ${failedPackage}`
          );
        } else {
          console.log(`❌ Command still failing for ${failedPackage}`);
        }
      }
    }
  });
};
