import { cp, read, rmSafe, write } from '@goldstack/utils-sh';
import { existsSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

/**
 * Parameters for injecting the legacy Next.js routes manifest next to a
 * routing handler.
 */
export interface InjectRoutesManifestParams {
  /** Directory containing the routing handler source files. */
  sourceDir: string;
  /** Directory containing the compiled routing handler files. */
  compiledDir: string;
}

/**
 * Determines whether a compiled routing handler still imports the legacy
 * Next.js routes manifest.
 *
 * Handlers using deterministic static-export routing do not need the manifest.
 * Keeping this check means projects that have not updated their handler yet
 * keep working after upgrading the deployment tooling.
 *
 * @param compiledFile - Path to the compiled routing handler.
 * @returns True if the handler imports the routes manifest.
 */
export function handlerUsesRoutesManifest(compiledFile: string): boolean {
  return existsSync(compiledFile) && read(compiledFile).includes('routes-manifest.json');
}

/**
 * Expands the Next.js routes manifest with one entry per statically exported
 * HTML page and writes the result next to the routing handler source and
 * compiled files.
 *
 * This is only required for legacy handlers that still import
 * `./routes-manifest.json`.
 *
 * @param params - The source and compiled routing handler directories.
 */
export async function injectRoutesManifest(params: InjectRoutesManifestParams): Promise<void> {
  const manifestFile = existsSync('webDist/routes-manifest.json')
    ? 'webDist/routes-manifest.json'
    : '.next/routes-manifest.json';

  const routesManifest = JSON.parse(read(manifestFile));
  const htmlPagePaths: string[] = await glob('webDist/**/*.html');

  const staticRoutes = htmlPagePaths.map((match) => {
    const pagePath = path
      .relative('webDist', match)
      .replace(/\\/g, '/')
      .replace(/\.html$/, '');
    return {
      page: `/${pagePath}`,
      regex: `^/${pagePath.replace(/\\/g, '\\\\').replace(/\//g, '\\/')}$`,
    };
  });

  routesManifest.dynamicRoutes = [...staticRoutes, ...routesManifest.dynamicRoutes];
  routesManifest.staticRoutes = staticRoutes;

  await rmSafe(`${params.sourceDir}routes-manifest.json`);
  write(JSON.stringify(routesManifest, null, 2), `${params.sourceDir}routes-manifest.json`);
  await rmSafe(`${params.compiledDir}routes-manifest.json`);
  cp('-f', `${params.sourceDir}routes-manifest.json`, `${params.compiledDir}routes-manifest.json`);
}
