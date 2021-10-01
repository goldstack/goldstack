import workspaceToTypeScriptReferences from '@monorepo-utils/workspaces-to-typescript-project-references';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const res = workspaceToTypeScriptReferences.toProjectReferences({
  rootDir: path.resolve('./'),
  checkOnly: false,
});

if (!res.ok) {
  if (res.aggregateError) {
    console.error(res.aggregateError.message);
  }
  process.exit(1);
}

const cmdRes = execSync('yarn workspaces list --json').toString();

const allPackages = cmdRes.split('\n').map((line) => {
  if (line.trim() === '') {
    return {
      path: undefined,
    };
  }
  const packageData = JSON.parse(line);
  if (packageData.location === '.') {
    return {
      path: undefined,
    };
  }
  return {
    path: packageData.location,
  };
});

const tsConfig = fs.readFileSync('./tsconfig.json').toString();

const tsConfigData = JSON.parse(tsConfig);

tsConfigData.references = allPackages.filter((packageData) => packageData.path);

fs.writeFileSync('./tsconfig.json', JSON.stringify(tsConfigData, null, 2));
