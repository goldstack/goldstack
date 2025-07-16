import NextJsIcon from 'src/icons/nextjs.svg';
import NodeJsIcon from 'src/icons/nodejs.svg';
import APIGateway from 'src/icons/aws-api-gateway.svg';
import LambdaIcon from 'src/icons/lambda.svg';
import ReactIcon from 'src/icons/reactjs.svg';
import SesIcon from 'src/icons/ses.svg';
import BootstrapIcon from 'src/icons/bootstrap_large.svg';

import S3Icon from 'src/icons/s3.svg';

import CloudFrontIcon from 'src/icons/cloudfront.svg';

import type { PackageListItem } from 'src/components/PackageList';

export const getTemplateData = (preferredElements: string[]): PackageListItem[] => {
  const baseList = [
    {
      packageName: 'NextJs + Bootstrap',
      packageId: 'template:app-nextjs-bootstrap',
      packageDescription: 'NextJS wired to work with Bootstrap and be deployed to CloudFront CDN',
      icons: [NextJsIcon, BootstrapIcon],
      selected: false,
      alwaysIncluded: false,
      features: [{ name: 'S3 + CloudFront CDN' }, { name: 'SASS' }, { name: 'SVG Icons' }],
    },
    {
      packageName: 'Lambda + Express',
      packageId: 'template:lambda-express',
      packageDescription: 'Scaleable and extensible backend based on Express',
      icons: [LambdaIcon, NodeJsIcon],
      selected: false,
      alwaysIncluded: false,
      features: [{ name: 'Bundled with esbuild' }, { name: 'API Gateway' }, { name: 'Helmet' }],
    },
    {
      packageName: 'React SSR',
      packageId: 'template:server-side-rendering',
      packageDescription: 'Serverless React Server-Side Rendering',
      icons: [ReactIcon, APIGateway, LambdaIcon],
      selected: false,
      alwaysIncluded: false,
      features: [
        { name: 'Server-Side Rendering' },
        { name: 'API Gateway' },
        { name: 'Small Lambda Packages' },
      ],
    },
    {
      packageName: 'Lambda API Gateway',
      packageId: 'template:serverless-api',
      packageDescription: 'Serverless API using AWS HTTP API and Lambdas.',
      icons: [APIGateway, LambdaIcon],
      selected: false,
      alwaysIncluded: false,
      features: [
        { name: 'API Gateway' },
        { name: 'Small Lambda Packages' },
        { name: 'File-based Routes' },
      ],
    },
    {
      packageName: 'NextJs',
      packageId: 'template:app-nextjs',
      packageDescription: 'Rapidly develop React applications deployed to AWS CloudFront CDN',
      icons: [NextJsIcon],
      selected: false,
      alwaysIncluded: false,
      features: [{ name: 'S3 + CloudFront CDN' }],
    },
    {
      packageName: 'Static Website',
      packageId: 'template:static-website-aws',
      packageDescription: 'Deploy static files to a CloudFront CDN',
      icons: [CloudFrontIcon],
      selected: false,
      alwaysIncluded: false,
      features: [{ name: 'S3 + CloudFront CDN' }],
    },
    {
      packageName: 'S3',
      packageId: 'template:s3',
      packageDescription: 'Store and manage files in AWS S3',
      icons: [S3Icon],
      selected: false,
      alwaysIncluded: false,
      features: [{ name: 'TypeScript API' }],
    },
    {
      packageName: 'Email Send',
      packageId: 'template:email-send',
      packageDescription: 'Send emails through AWS SES',
      icons: [SesIcon],
      selected: false,
      alwaysIncluded: false,
      features: [
        { name: 'DKIM and SPF' },
        { name: 'High volume sending' },
        { name: 'Extremely low costs' },
      ],
    },
  ];

  const headList = baseList
    .filter((pkg) => {
      const res = preferredElements.includes(pkg.packageId);
      return res;
    })
    .map((el) => ({ ...el, selected: true }));

  const tailList = baseList.filter((pkg) => {
    return !preferredElements.find((el) => pkg.packageId === el);
  });

  return [...headList, ...tailList];
};
