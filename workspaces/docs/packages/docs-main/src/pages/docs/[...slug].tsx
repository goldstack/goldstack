import { generateToc, type Heading } from '@goldstack/toc-generator';
import { pwd, read } from '@goldstack/utils-sh';
import cheerio from 'cheerio';
import fs from 'fs';
import type { GetStaticPaths, GetStaticProps } from 'next';
import Docs from './../../components/Docs';
import paths from './../../data/docs/paths.json';

interface PageData {
  html: string;
  data: {
    title: string;
    // other fields may exist but are not used here
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      ...paths,
      // temporary workaround for redirects
      'modules/app-nextjs-bootstrap',
      'modules/lambda-api',
      'modules/app-nextjs',
      'modules/lambda-express',
      'modules/email-send',
      'modules/static-website-aws',
      'modules/s3',
      'modules/lambda-go-gin',
    ]
      .filter((el) => el !== '/')
      .map((path) => ({
        params: {
          slug: path.split('/'),
        },
      })),
    fallback: false, // Show 404 for pages that are not prerendered
  };
};

const redirects = [
  {
    source: 'modules/app-nextjs-bootstrap',
    destination: 'templates/app-nextjs-bootstrap',
    permanent: true,
  },
  {
    source: 'modules/lambda-api',
    destination: 'templates/serverless-api',
    permanent: true,
  },
  {
    source: 'modules/app-nextjs',
    destination: 'templates/app-nextjs',
    permanent: true,
  },
  {
    source: 'modules/lambda-express',
    destination: 'templates/lambda-express',
    permanent: true,
  },
  {
    source: 'modules/email-send',
    destination: 'templates/email-send',
    permanent: true,
  },
  {
    source: 'modules/static-website-aws',
    destination: 'templates/static-website-aws',
    permanent: true,
  },
  {
    source: 'modules/s3',
    destination: 'templates/s3',
    permanent: true,
  },
  {
    source: 'modules/lambda-go-gin',
    destination: 'templates/lambda-go-gin',
    permanent: true,
  },
];

export const getStaticProps: GetStaticProps = async (context) => {
  const query = context.params || {};

  let path = query.slug ? (query.slug as string[]).join('/') : '/';

  redirects.forEach((redirect) => {
    path = path.replace(redirect.source, redirect.destination);
  });
  let pageData: PageData | null = null;
  let toc: Heading[];

  const filePath = pwd() + '/src/data/docs/' + path + '/index.json';
  console.debug(`Reading documentation file from ${filePath}`);
  if (fs.existsSync(filePath)) {
    pageData = JSON.parse(read(filePath)) as PageData;
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
