import type { ProjectTemplateProps } from '../projectTemplateTypes';
import { Express } from './moduleData';
import {
  featureAppComposition,
  featureVSCode,
  featureYarn3,
} from './sharedFeatures';

export const getExpressTemplateData = (): ProjectTemplateProps => {
  return {
    id: 'express-lambda',
    title: 'Express.js Lambda',
    images: ['nodejs', 'lambda', 'typescript'],
    packages: [Express],
    isComposite: false,
    description: 'Rapidly deploy an Express.js server to AWS Lambda.',
    metaTitle: 'Serverless Express.js Template and Boilerplate by Goldstack',
    metaDescription:
      'Open source Express.js template configured for deployment with AWS Lambda. Configure the template for your project and download it for free.',
    longDescription:
      'This project template contains an Express.js server ready to be packaged and deployed as an AWS Lambda.\n',
    actionLink: '/build?stack=express',
    tags: ['Express.js', 'Backend', 'Lambda', 'Serverless'],
    featuresOverview: [
      {
        title: 'Express.js',
        id: 'expressjs',
        description:
          'Start developing your Serverless Express server in minutes.',
        image: 'nodejs',
        details: {
          title: 'Express.js Project Ready in Minutes',
          description:
            'Begin your work with a carefully crafted project where all dependencies you need are provided in compatible versions.',
          content: {
            type: 'project-install',
            data: {
              projectName: 'app-express-lambda',
            },
          },
        },
      },
      {
        title: 'TypeScript',
        id: 'typescript',
        description:
          'Develop all routes for your Express.js application with TypeScript.',
        image: 'typescript',
        details: {
          title: 'Full TypeScript Support',
          description:
            'Benefit from static type checking and code completion when developing your routes and backend logic with Express.js',
          content: {
            type: 'image',
            data: {
              image: 'endpoint-typescript',
            },
          },
        },
      },
      {
        title: 'ESLint + Prettier',
        id: 'eslint',
        description:
          'Auto-format and validate your TypeScript and Express code easily using ESLint and Prettier.',
        image: 'eslint',
        details: {
          title: 'Linting and Formatting',
          description:
            'ESLint and Prettier configured for usage in the CLI and as VSCode plugins. Optimized to work with Express.js and TypeScript.',
          icons: ['eslint'],
          content: {
            type: 'none',
            data: {},
          },
        },
      },
      featureVSCode(),
      {
        title: 'Jest',
        id: 'jest',
        description: 'Run tests for Express.js routes using Jest.',
        image: 'jest',
        details: {
          title: 'Unit and Integration Testing',
          description:
            'Write unit and integration tests for your Express.js application with zero additional setup required.',
          icons: ['jest'],
          content: {
            type: 'none',
            data: {},
          },
        },
      },
      featureYarn3(),
      {
        title: 'AWS',
        id: 'aws',
        description:
          'Express.js server deployed to reliable and scaleable AWS serverless infrastructure.',
        image: 'aws',
        details: {
          title: 'Ready for Deployment to AWS',
          description:
            'Deploy your Express.js server for cents on AWS with professional level security, reliability and scaleability.',
          content: {
            type: 'aws-deployment',
            data: {},
          },
          moreDetails: {
            description:
              'Supports multiple, separate deployments for development, staging and production environments. Implemented using API Gateway and Lambda.',
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
            'Easily add any service from the AWS cloud to your Express.js application by modifying the Terraform files included in the template.',
          icons: ['terraform'],
          content: {
            type: 'none',
            data: {},
          },
        },
      },
      featureAppComposition([
        'template:app-nextjs-bootstrap',
        'template:s3',
        'template:email-send',
      ]),
    ],
  };
};
