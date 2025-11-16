import fs, { type Dirent } from 'fs';
import { posix, relative, resolve, sep } from 'path';
import type { LambdaConfig } from '../types/LambdaConfig';
import { RouteType } from '../types/LambdaConfig';

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

  return flattenConfig(result.children).filter((e) => e.type === RouteType.FUNCTION);
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

function posixPath(pathString: string): string {
  return pathString.split(sep).join(posix.sep);
}

function removeExtension(path: string): string {
  return path.replace(/\.[^/.]+$/, '');
}

function makePath(configRoot: string, dir: string): string {
  const path = removeExtension(posixPath(relative(configRoot, dir)));
  if (path === '$index') {
    return '/';
  }
  if (path.indexOf('$index') !== -1) {
    let newPath = path.replace('$index', '');
    // API Gateway does not accept routes like /my_route/
    newPath = newPath.slice(0, newPath.length - 1);
    return `/${newPath}`;
  }
  if (path === '$default') {
    return '$default';
  }
  return `/${path}`;
}

function makeRoute(configRoot: string, dir: string): string {
  const route = makePath(configRoot, dir);
  if (route === '$default') {
    return '$default';
  }
  return `ANY ${route}`;
}

function readLambdaConfigImpl(configRoot: string, dir: string): LambdaConfigWork {
  const root = dir;

  const rootRoute = makeRoute(configRoot, dir);
  const configItem: LambdaConfigWork = {
    name: root,
    type: RouteType.DIR,
    absoluteFilePath: dir,
    path: makePath(configRoot, dir),
    relativeFilePath: relative(configRoot, dir),
    route: rootRoute,
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
      if (!(dirEntry.name.endsWith('.ts') || dirEntry.name.endsWith('.tsx'))) {
        continue;
      }

      const route = makeRoute(configRoot, fullPath);

      configItem.children[name] = {
        name: removeExtension(name),
        type: RouteType.FUNCTION,
        path: makePath(configRoot, fullPath),
        absoluteFilePath: fullPath,
        relativeFilePath: relative(configRoot, fullPath),
        route: route,
      };
    } else {
    }
  }
  dirHandle.closeSync();

  return configItem;
}
