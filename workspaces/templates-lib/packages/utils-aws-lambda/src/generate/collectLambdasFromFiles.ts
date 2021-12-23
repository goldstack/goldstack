import fs, { Dirent } from 'fs';
import { relative, resolve, sep, posix } from 'path';

export enum RouteType {
  DIR = 'DIR',
  FUNCTION = 'FUNCTION',
}

export interface LambdaConfig {
  name: string;
  type: RouteType;
  absolutePath: string;
  relativePath: string;
  route: string;
}

interface LambdaConfigWork extends LambdaConfig {
  children?: LambdaConfigMap;
}

interface LambdaConfigMap {
  [key: string]: LambdaConfigWork;
}

export function readLambdaConfig(dir: string): LambdaConfig[] {
  const result = readLambdaConfigImpl(dir, dir);

  if (!result.children) {
    throw new Error('Invalid directory ' + dir);
  }

  return flattenConfig(result.children).filter(
    (e) => e.type === RouteType.FUNCTION
  );
}

function flattenConfig(config: LambdaConfigMap): LambdaConfig[] {
  const arr: LambdaConfig[] = [];
  for (const child of Object.entries(config)) {
    const newVal = { ...child[1] };
    newVal.children = undefined;
    arr.push(newVal);
    if (child[1].children) {
      arr.push(...flattenConfig(child[1].children));
    }
  }
  return arr;
}

function posixPath(pathstring: string): string {
  return pathstring.split(sep).join(posix.sep);
}

function removeExtension(path: string): string {
  return path.replace(/\.[^/.]+$/, '');
}

function makeRoute(configRoot: string, dir: string) {
  const route = removeExtension(posixPath(relative(configRoot, dir)));
  if (route === 'index') {
    return 'ANY /{proxy+}';
  }
  if (route === 'default') {
    return '$default';
  }
  return `ANY /${route}/{proxy+}`;
}

function readLambdaConfigImpl(
  configRoot: string,
  dir: string
): LambdaConfigWork {
  const root = dir;

  const configItem: LambdaConfigWork = {
    name: root,
    type: RouteType.DIR,
    absolutePath: dir,
    relativePath: relative(configRoot, dir),
    route: makeRoute(configRoot, dir),
  };

  const dirHandle = fs.opendirSync(dir);
  let dirEntry: Dirent | null;
  while ((dirEntry = dirHandle.readSync()) !== null) {
    if (!configItem.children) {
      configItem.children = {};
    }
    const name = dirEntry.name;
    const fullPath = resolve(root, name);
    if (dirEntry.isDirectory()) {
      configItem.children[name] = readLambdaConfigImpl(configRoot, fullPath);
    } else if (dirEntry.isFile()) {
      configItem.children[name] = {
        name: removeExtension(name),
        type: RouteType.FUNCTION,
        absolutePath: fullPath,
        relativePath: relative(configRoot, fullPath),
        route: makeRoute(configRoot, fullPath),
      };
    } else {
      continue;
    }
  }
  dirHandle.closeSync();

  return configItem;
}
