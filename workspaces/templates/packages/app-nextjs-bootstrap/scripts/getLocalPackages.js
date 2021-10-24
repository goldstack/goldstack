/* eslint-disable @typescript-eslint/no-var-requires */
const childProcess = require('child_process');
const fs = require('fs');

const getPackages = (cmdRes) => {
  return cmdRes
    .split('\n')
    .map((line) => {
      if (line.trim() === '') {
        return {
          path: undefined,
          name: undefined,
        };
      }
      const packageData = JSON.parse(line);
      if (packageData.location === '.') {
        return {
          path: undefined,
          name: undefined,
        };
      }
      return {
        path: packageData.location,
        name: packageData.name,
      };
    })
    .filter((packageData) => packageData.path && packageData.name);
};

exports.getLocalPackages = function () {
  const allWorkspaces = getPackages(
    childProcess.execSync('yarn workspaces list --json').toString()
  );

  const packageJson = fs.readFileSync('./package.json').toString();
  const packageJsonData = JSON.parse(packageJson);

  const allDependencies = [
    ...Object.keys(packageJsonData.dependencies || {}),
    ...Object.keys(packageJsonData.devDependencies || {}),
  ];

  return allDependencies.filter((dependency) => {
    return (
      allWorkspaces.filter((localDep) => localDep.name === dependency).length >
      0
    );
  });
};
