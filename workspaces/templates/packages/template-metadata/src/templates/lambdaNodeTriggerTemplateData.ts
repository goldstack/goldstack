import type { ProjectTemplateProps } from '../projectTemplateTypes';
import { LambdaNodeTrigger } from './moduleData';

export const getLambdaNodeJobTemplateData = (): ProjectTemplateProps => {
  return {
    id: 'lambda-node-trigger',
    title: 'AWS Lambda Node.js Trigger',
    images: ['https://cdn.goldstack.party/img/202203/nodejs.svg', 'lambda'],
    packages: [LambdaNodeTrigger],
    isComposite: false,
    description:
      'Deploy a Node.js function triggered by a schedule or SQS message using AWS Lambda',
    metaTitle: 'Serverless Node.js Trigger Template for AWS Lambda',
    metaDescription:
      'Deploy a Node.js app as a scheduled job or SQS-triggered function on AWS Lambda. Infrastructure in Terraform, deployment scripts included.',
    longDescription:
      'This project template contains a Node.js function deployed to AWS Lambda, which can be triggered by a schedule or an SQS message.\n' +
      'See a list of all features included in this template below.',
    actionLink: '/build?stack=lambda-node-trigger',
    tags: ['Node.js', 'Schedule', 'SQS', 'Backend', 'Lambda', 'Serverless'],
    featuresOverview: [
      {
        title: 'Serverless Node.js Trigger',
        id: 'serverless-nodejs-trigger',
        description:
          'Write Node.js code that will be run on a schedule or triggered by an SQS message on AWS',
        image: 'https://cdn.goldstack.party/img/202203/nodejs.svg',
        details: {
          title: 'Develop Node.js Logic',
          description:
            'Write Node.js code including dependencies that will be packaged up for deployment to AWS.',
          content: {
            type: 'image',
            data: {
              image:
                'https://cdn.goldstack.party/img/202410/lambda_handler.png',
            },
          },
        },
      },
      {
        title: 'AWS',
        id: 'aws',
        description:
          'Lambda deployed to reliable and scalable AWS serverless infrastructure.',
        image: 'aws',
        details: {
          title: 'Ready for Deployment to AWS',
          description:
            'Deploy your Node.js function for cents on AWS with professional level security, reliability, and scalability.',
          content: {
            type: 'aws-deployment',
            data: {},
          },
          moreDetails: {
            description:
              'Supports multiple, separate deployments for development, staging, and production environments. Implemented using Lambda, EventBridge, and SQS triggers.',
          },
        },
      },
      {
        title: 'Yarn 3',
        id: 'yarn',
        description:
          'Build scripts managed using Yarn for easy integration with frontend projects.',
        image: 'yarn',
        details: {
          title: 'Cross-platform Workspace Management',
          description:
            'This template includes a workspace for a Node.js project managed by Yarn. ' +
            'This allows for cross-platform script definition and manage other components in the same workspace.',
          icons: ['yarn'],
          content: {
            type: 'none',
            data: {},
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
            'Easily add additional resources from the AWS cloud to your application by modifying the Terraform files included in the template.',
          icons: ['terraform'],
          content: {
            type: 'none',
            data: {},
          },
        },
      },
      {
        title: 'App Composition',
        id: 'composition',
        description:
          'Easily combine with any Goldstack module to compose end-to-end applications.',
        image: 'composition',
        details: {
          title: 'Integrate with Goldstack Templates',
          description:
            'Combine this template with other modules from Goldstack. Generate a starter project supporting your full stack including the frontend.',
          content: {
            type: 'combine-templates',
            data: {
              templates: [
                'template:app-nextjs-bootstrap',
                'template:s3',
                'template:email-send',
              ],
            },
          },
          moreDetails: {
            description:
              'Simply choose any of these templates while building your project in the Goldstack Builder UI and they will be included in your starter project.',
          },
        },
      },
    ],
  };
};
