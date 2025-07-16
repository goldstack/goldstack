import { read, write, mkdir, cp } from '@goldstack/utils-sh';
import { renderPage } from '@goldstack/utils-docs';

import path from 'path';
import assert from 'assert';

export interface SitemapItem {
  title: string;
  path: string;
  children: SitemapItem[];
}

interface Results {
  paths: string[];
  sitemap: SitemapItem[];
}

type Node =
  | string
  | {
      home?: string;
      directory?: string;
      children?: Node[];
    };

const processNode = async (params: {
  node: Node;
  source: string;
  destination: string;
  rootDirectory: string;
}): Promise<Results> => {
  let filePath: string | undefined;
  if (typeof params.node === 'string') {
    filePath = params.node;
  } else {
    filePath = params.node.home;
    if (params.node.directory) {
      filePath = params.node.directory + filePath;
    }
  }
  assert(filePath);

  const { dir, name } = path.parse(filePath);
  mkdir('-p', params.destination + dir);
  const sourceFile = params.source + filePath;
  const destinationFile = params.destination + dir + (dir ? '/' : '') + name + '.json';
  const data = await renderPage(sourceFile);
  write(JSON.stringify(data, null, 2), destinationFile);

  let pagePath =
    (dir
      ? path.relative(params.rootDirectory, params.destination + dir).replace(/\\/g, '/') + '/'
      : '') + name;
  if (pagePath === 'index' && !dir) {
    pagePath = '/';
  } else if (pagePath.endsWith('/index')) {
    pagePath = pagePath.substr(0, pagePath.length - '/index'.length);
  }

  const sitemapEntry = {
    title: data.data.title,
    path: pagePath,
    children: [],
  };

  if (typeof params.node === 'string' || !params.node.children) {
    return {
      paths: [pagePath],
      sitemap: [sitemapEntry],
    };
  }

  const newSource = params.node.directory ? params.source + params.node.directory : params.source;
  const newDestination = params.node.directory
    ? params.destination + params.node.directory
    : params.destination;

  const resultsPromise = params.node.children.map(async (node) => {
    return await processNode({
      source: newSource,
      destination: newDestination,
      rootDirectory: params.rootDirectory,
      node,
    });
  });
  const results = await Promise.all(resultsPromise);

  const childrenSitemap = results.map((el) => el.sitemap[0]);

  return results.reduce(
    (acc, curr) => ({
      paths: [...acc.paths, ...curr.paths],
      sitemap: acc.sitemap,
    }),
    {
      paths: [pagePath],
      sitemap: [
        {
          ...sitemapEntry,
          children: childrenSitemap,
        },
      ],
    },
  );
};

export const generateDocs = async (params: {
  source: string;
  destination: string;
}): Promise<Results> => {
  const navigation = JSON.parse(read(params.source + 'navigation.json'));

  cp('-f', params.source + 'navigation.json', params.destination + 'navigation.json');
  const res = await processNode({
    node: navigation,
    source: params.source,
    destination: params.destination,
    rootDirectory: params.destination,
  });

  write(JSON.stringify(res.paths, null, 2), params.destination + 'paths.json');
  write(JSON.stringify(res.sitemap, null, 2), params.destination + 'sitemap.json');
  return res;
};
