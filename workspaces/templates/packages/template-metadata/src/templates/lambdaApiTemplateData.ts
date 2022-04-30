import { ProjectTemplateProps } from '../projectTemplateTypes';
import { LambdaAPI } from './moduleData';
import { featureYarn } from './nextjsTemplateData';

export const getServerlessApiTemplate = (): ProjectTemplateProps => {
  return {
    id: 'serverless-api',
    title: 'Serverless API',
    images: ['api-gateway', 'lambda', 'nodejs', 'typescript'],
    packages: [LambdaAPI],
    isComposite: false,
    metaTitle: 'Serverless API Template and Boilerplate for AWS Lambda',
    metaDescription:
      'Open source template for developing a Serverless API using AWS API Gateway. Generates unique lambdas for each endpoint for reduced cold start times.',
    description:
      'Rapidly develop an API using AWS HTTP API and Lambdas with minimal configuration.',
    longDescription:
      'This project template provides utilities to define the infrastructure for an API deployed on AWS using AWS HTTP Gateway and Lambda functions.\n',
    tags: ['HTTP API', 'REST', 'Backend', 'Lambda', 'Serverless'],
    hero: {
      title: 'REST API using AWS Gateway and Lambdas',
      content: `
          <p>
            Define an API using API Gateway and AWS Lambdas. All infrastructure dynamically generated from file-based routes.
          </p>
          <p>
            Scroll down to learn more about what&apos;s included in this
            template.
          </p>
        `,
      action: {
        title: '✔ Start Building Your Project Now',
        link: '/build?stack=serverless-api',
      },
    },
    featuresOverview: [
      {
        title: 'Serverless API',
        id: 'serverless-api',
        description:
          'Develop a serverless API using AWS API Gateway and Lambdas',
        image: 'api-gateway',
        details: {
          title: 'Serverless API using AWS API Gateway and Lambdas',
          description:
            'Benefit from low costs, high scaleability and low maintenance by using modern Serverless practices. Each route defined in its own Lambda for minimal cold start times.',
          content: {
            type: 'image',
            data: {
              image:
                'https://cdn.goldstack.party/img/202201/lambda-api-architecture.gif',
            },
          },
        },
      },
      {
        title: 'TypeScript',
        id: 'typescript',
        description: 'Develop all routes for your API using TypeScript.',
        image: 'typescript',
        details: {
          title: 'Full TypeScript Support',
          description:
            'Benefit from static type checking and code completion when developing your routes.',
          content: {
            type: 'image',
            data: {
              image:
                'https://cdn.goldstack.party/img/202201/lambda-api-typescript-example.gif',
            },
          },
        },
      },
      {
        title: 'Local Testing',
        id: 'local-testing',
        description: 'Test your API using a local server',
        image: 'https://cdn.goldstack.party/img/202201/search.svg',
        details: {
          title: 'Local Testing',
          description: 'Run a local server for testing your API.',
          content: {
            type: 'image',
            data: {
              image:
                'https://cdn.goldstack.party/img/202201/lambda-api-local-testing.gif',
            },
          },
        },
      },
      {
        title: 'Jest',
        id: 'jest',
        description: 'Write tests for the Serverless API using Jest.',
        image: 'jest',
        details: {
          title: 'Unit and Integration Testing',
          description: 'Write efficient tests against a local API.',
          icons: ['jest'],
          content: {
            type: 'none',
            data: {},
          },
        },
      },
      {
        title: 'ESLint + Prettier',
        id: 'eslint',
        description:
          'Auto-format and validate your TypeScript code easily using ESLint and Prettier.',
        image: 'eslint',
        details: {
          title: 'Linting and Formatting',
          description:
            'ESLint and Prettier configured for usage in the CLI and as VSCode plugins.',
          icons: ['eslint'],
          content: {
            type: 'none',
            data: {},
          },
        },
      },
      {
        title: 'VSCode',
        id: 'vscode',
        description:
          'Configured to work seamlessly with the powerful VSCode editor.',
        image: 'vscode',
        details: {
          title: 'Develop in VSCode',
          description:
            'All configuration for developing TypeScript code with VSCode provided.',
          icons: ['vscode'],
          content: {
            type: 'none',
            data: {},
          },
        },
      },
      featureYarn,
      {
        title: 'AWS',
        id: 'aws',
        description:
          'API deployed to reliable and scaleable AWS serverless infrastructure.',
        image: 'aws',
        details: {
          title: 'Ready for Deployment to AWS',
          description:
            'Deploy your API for cents on AWS with professional level security, reliability and scaleability.',
          content: {
            type: 'aws-deployment',
            data: {},
          },
          moreDetails: {
            description:
              'Supports multiple, separate deployments for development, staging and production environments. Implemented using HTTP API Gateway and Lambda.',
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
            'Customise infrastructure and easily add any service from the AWS cloud to your application by modifying the Terraform files included in the template.',
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
