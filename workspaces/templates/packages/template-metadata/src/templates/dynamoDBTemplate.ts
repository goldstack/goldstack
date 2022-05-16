import { ProjectTemplateProps } from '../projectTemplateTypes';
import { DynamoDB } from './moduleData';
import { ShortTemplateFeature } from '../projectTemplateData';
import {
  featureAppComposition,
  featureVSCode,
  featureYarn3,
} from './sharedFeatures';

export const getDynamoDBFeature = (): ShortTemplateFeature => {
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

export const getDynamoDBTemplateData = (): ProjectTemplateProps => {
  return {
    id: 'dynamodb',
    title: 'DynamoDB',
    metaTitle: 'DynamoDB template for Node.js implemented with TypeScript',
    metaDescription:
      'Open source template for working with DynamoDB in Node.js. Configure for your needs in our project builder or clone boilerplate.',
    images: [
      'https://cdn.goldstack.party/img/202205/dynamodb.svg',
      'terraform',
      'typescript',
    ],
    packages: [DynamoDB],
    isComposite: false,
    boilerplateLink: 'https://github.com/goldstack/dynamodb-boilerplate',
    description: 'Manage data with DynamoDB.',
    longDescription:
      'This template adds the capability to write and query data with DynamoDB to your project.',
    tags: ['AWS', 'DynamoDB', 'Terraform', 'TypeScript', 'Yarn', 'Backend'],
    hero: {
      title: 'Manage Data with DynamoDB',
      content: `
        <p>
          The DynamoDB template enables your application to work with data in DynamoDB.
        </p>
          <p>
            Scroll down to learn more about what&apos;s included in this
            template.
          </p>
        `,
      action: {
        title: '✔ Start Building Your Project Now',
        link: '/build?stack=dynamodb',
      },
    },
    featuresOverview: [
      getDynamoDBFeature(),
      {
        title: 'TypeScript',
        id: 'typescript',
        description: 'Store and query using a TypeScript API.',
        image: 'typescript',
        details: {
          title: 'TypeScript configured in template',
          description:
            'Benefit from static type checking and code completion when developing your database logic using DynamoDB Toolbox.',
          content: {
            type: 'image',
            data: {
              image:
                'https://cdn.goldstack.party/img/202205/dynamodb-typescript.png',
            },
          },
        },
      },
      {
        title: 'Jest',
        id: 'jest',
        description: 'Run tests for DynamoDB related logic with Jest.',
        image: 'jest',
        details: {
          title: 'Unit and Integration Testing',
          description:
            'Write unit and integration tests for your database logic. Based on Local DynamoDB.',
          icons: ['jest'],
          content: {
            type: 'image',
            data: {
              image: 'https://cdn.goldstack.party/img/202204/dynamodb_jest.png',
            },
          },
        },
      },
      {
        title: 'AWS',
        id: 'aws',
        description:
          'Build on the scaleable AWS infrastructure and combine your DynamoDB table with other services.',
        image: 'aws',
        details: {
          title: 'Ready for Deployment to AWS',
          description:
            'Deploy serverless infrastructure for cents on AWS with professional level security, reliability and scaleability.',
          content: {
            type: 'aws-deployment',
            data: {},
          },
          moreDetails: {
            description:
              'Supports multiple, separate deployments for development, staging and production environments.',
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
            'Easily modify and extend your DynamoDB configuration by working with the Terraform files included in the template.',
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
