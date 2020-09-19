import Docs from './../../components/Docs';

import { GetStaticProps, GetStaticPaths } from 'next';
import paths from './../../data/docs/paths.json';
import { read, pwd } from '@goldstack/utils-sh';
import fs from 'fs';

export const getStaticPaths: GetStaticPaths = async () => {
  console.log(paths);
  return {
    paths: paths.map((path) => ({
      params: {
        slug: path.split('/'),
      },
    })),
    fallback: false, // Show 404 for pages that are not prerendered
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  // console.log(context.params);
  const query = context.params || {};

  const path = query.slug ? (query.slug as string[]).join('/') : '/';

  console.log(context);
  console.log(path);
  // const { path } = context.params.query;
  // console.log(path);
  let pageData: any;
  console.log(__dirname);
  const filePath = pwd() + '/src/data/docs/' + path + '/index.json';
  console.debug(`Reading documentation file from ${filePath}`);
  if (fs.existsSync(filePath)) {
    pageData = JSON.parse(read(filePath));
  } else {
    pageData = null;
  }

  console.log(pageData);
  return {
    props: {
      contentHtml: pageData ? pageData.html : null,
      title: pageData ? pageData.data.title : null,
    },
  };

  // return {
  //   props: {},
  // };
};

export default Docs;
