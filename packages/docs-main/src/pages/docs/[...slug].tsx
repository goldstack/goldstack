import Docs from './../../components/Docs';

import { GetStaticProps, GetStaticPaths } from 'next';
import paths from './../../data/docs/paths.json';
import { read, pwd } from '@goldstack/utils-sh';
import fs from 'fs';

import { generateToc, Heading } from '@goldstack/toc-generator';
import cheerio from 'cheerio';

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: paths
      .filter((el) => el !== '/')
      .map((path) => ({
        params: {
          slug: path.split('/'),
        },
      })),
    fallback: false, // Show 404 for pages that are not prerendered
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const query = context.params || {};

  const path = query.slug ? (query.slug as string[]).join('/') : '/';

  // const { path } = context.params.query;
  // console.log(path);
  let pageData: any;
  let toc: Heading[];

  const filePath = pwd() + '/src/data/docs/' + path + '/index.json';
  console.debug(`Reading documentation file from ${filePath}`);
  if (fs.existsSync(filePath)) {
    pageData = JSON.parse(read(filePath));
    const $ = cheerio.load(pageData.html);
    toc = generateToc($);
  } else {
    pageData = null;
    toc = [];
  }

  return {
    props: {
      contentHtml: pageData ? pageData.html : null,
      title: pageData ? pageData.data.title : null,
      toc,
    },
  };
};

export default Docs;
