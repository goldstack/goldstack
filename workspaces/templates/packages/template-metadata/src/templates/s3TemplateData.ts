import { ProjectTemplateProps } from '../projectTemplateTypes';
import { S3 } from './moduleData';
import { ShortTemplateFeature } from '../projectTemplateData';
import {
  featureAppComposition,
  featureVSCode,
  featureYarn3,
} from './sharedFeatures';

export const getS3Feature = (): ShortTemplateFeature => {
  return {
    title: 'Storing files and data in AWS S3',
    id: 's3',
    description:
      'Easily store files and data with high durability and low costs in AWS S3.',
    image: 's3',
    details: {
      title: 'Easy to Use API to Connect with AWS S3',
      description:
        'Connect to an S3 bucket and add objects using the TypeScript API.',
      content: {
        type: 'image',
        data: {
          image: 'https://cdn.goldstack.party/img/202204/s3_api.png',
        },
      },
    },
  };
};

export const getS3TemplateData = (): ProjectTemplateProps => {
  return {
    id: 's3',
    title: 'AWS S3',
    metaTitle: 'AWS S3 Template and Boilerplate Configured using Terraform',
    metaDescription:
      'Open source template for defining an S3 bucket with Terraform. Optimised for inclusion in TypeScript projects. Configure and download for free.',
    images: ['s3', 'terraform', 'typescript'],
    packages: [S3],
    isComposite: false,
    boilerplateLink:
      'https://github.com/goldstack/s3-terraform-typescript-boilerplate',
    description: 'Store data in AWS S3.',
    longDescription:
      'This template adds the capability to store data in AWS S3 to your project.',
    tags: ['AWS', 'S3', 'TypeScript', 'Yarn', 'Backend'],
    hero: {
      title: 'Store Data in S3',
      content: `
        <p>
          The AWS S3 template enables your application to store data in AWS S3.
        </p>
          <p>
            Scroll down to learn more about what&apos;s included in this
            template.
          </p>
        `,
      action: {
        title: '✔ Start Building Your Project Now',
        link: '/build?stack=s3',
      },
    },
    featuresOverview: [
      getS3Feature(),
      {
        title: 'TypeScript',
        id: 'typescript',
        description: 'Connect to and store objects using a TypeScript API.',
        image: 'typescript',
        details: {
          title: 'TypeScript configured in template',
          description:
            'Benefit from static type checking and code completion when developing your S3 integration',
          content: {
            type: 'image',
            data: {
              image: 'https://cdn.goldstack.party/img/202204/s3_typescript.png',
            },
          },
        },
      },
      {
        title: 'Jest',
        id: 'jest',
        description: 'Run tests for S3 related logic with Jest.',
        image: 'jest',
        details: {
          title: 'Unit and Integration Testing',
          description:
            'Write unit and integration tests for your S3 integration. Utilities for local mocking included.',
          icons: ['jest'],
          content: {
            type: 'image',
            data: {
              image: 'https://cdn.goldstack.party/img/202204/s3_jest.png',
            },
          },
        },
      },
      {
        title: 'AWS',
        id: 'aws',
        description:
          'Use the AWS S3 for reliably and cheaply send high volume emails.',
        image: 'aws',
        details: {
          title: 'Ready for Deployment to AWS',
          description:
            'Deploy gigabytes of data for cents on AWS with professional level security, reliability and scaleability.',
          content: {
            type: 'aws-deployment',
            data: {},
          },
          moreDetails: {
            description:
              'Supports multiple, separate deployments for development, staging and production environments. Implemented using S3.',
          },
        },
      },
      {
        title: 'Terraform',
        id: 'terraform',
        description: 'Extend and maintain infrastructure using Terraform.',
        image: 'terraform',
        details: {
          title: 'Extendable and Configurable Infrastructure',
          description:
            'Easily modify and extend your S3 configuration by working with the Terraform files included in the template.',
          icons: ['terraform'],
          content: {
            type: 'none',
            data: {},
          },
        },
      },
      featureYarn3(),
      featureVSCode(),
      featureAppComposition([
        'template:serverless-api',
        'template:express-lambda',
      ]),
    ],
  };
};
