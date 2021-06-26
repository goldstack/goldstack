import NextJsIcon from 'src/icons/nextjs.svg';
import NodeJsIcon from 'src/icons/nodejs.svg';
import LambdaIcon from 'src/icons/lambda.svg';
import SesIcon from 'src/icons/ses.svg';
import BootstrapIcon from 'src/icons/bootstrap_large.svg';

import S3Icon from 'src/icons/s3.svg';

import CloudFrontIcon from 'src/icons/cloudfront.svg';

import { PackageListItem } from 'src/components/PackageList';

export const getTemplateData = (
  preferredElements: string[]
): PackageListItem[] => {
  const baseList = [
    {
      packageName: 'NextJs + Bootstrap',
      packageId: 'template:app-nextjs-bootstrap',
      packageDescription:
        'NextJS wired to work with Bootstrap and be deployed to CloudFront CDN',
      icons: [NextJsIcon, BootstrapIcon],
      selected: false,
      alwaysIncluded: false,
      features: [
        { name: 'S3 + CloudFront CDN' },
        { name: 'SASS' },
        { name: 'SVG Icons' },
      ],
    },
    {
      packageName: 'Lambda + Express',
      packageId: 'template:lambda-express',
      packageDescription: 'Scaleable and extensible backend based on Express',
      icons: [LambdaIcon, NodeJsIcon],
      selected: false,
      alwaysIncluded: false,
      features: [
        { name: 'Packed with Webpack' },
        { name: 'API Gateway' },
        { name: 'Helmet' },
      ],
    },
    {
      packageName: 'NextJs',
      packageId: 'template:app-nextjs',
      packageDescription:
        'Rapidly develop React applications deployed to AWS CloudFront CDN',
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
