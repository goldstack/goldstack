import type { ProjectTemplateProps } from '../projectTemplateTypes';
import { ServerSideRendering } from './moduleData';
import { featureYarn } from './nextjsTemplateData';

export const getServerSideRenderingTemplate = (): ProjectTemplateProps => {
  return {
    id: 'server-side-rendering',
    title: 'Server-Side Rendering',
    images: ['react', 'api-gateway', 'lambda', 'nodejs', 'typescript'],
    boilerplateLink: 'https://github.com/goldstack/react-ssr',
    packages: [ServerSideRendering],
    isComposite: false,
    metaTitle: 'Lightweight React Server-Side Rendering with AWS Lambda',
    metaDescription:
      'Open source template for developing a React Server-Side Rendering (SSR) application using AWS API Gateway and AWS Lambda.',
    description:
      'Develop an SSR application using React and serverless AWS infrastructure.',
    longDescription:
      'This project template provides utilities to define the infrastructure for an SSR application deployed on AWS using AWS API Gateway and Lambda functions.',
    actionLink: '/build?stack=server-side-rendering',
    tags: [
      'Server-Side Rendering',
      'React',
      'HTTP API',
      'REST',
      'Backend',
      'Lambda',
      'Serverless',
    ],
    featuresOverview: [
      {
        title: 'Serverless Page Rendering and API',
        id: 'serverless-rendering-and-api',
        description:
          'Develop a serverless React rendering and API using AWS API Gateway and Lambdas',
        image: 'api-gateway',
        details: {
          title:
            'Serverless React rendering and API using AWS API Gateway and Lambdas',
          description:
            'Benefit from low costs, high scaleability and low maintenance by using modern Serverless practices. Each page and route defined in its own Lambda for minimal cold start times.',
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
        title: 'Local Testing',
        id: 'local-testing-react-ssr',
        description: 'Test your application using a local server',
        image: 'https://cdn.goldstack.party/img/202201/search.svg',
        details: {
          title: 'Local Testing',
          description:
            'Test all our pages and routes with a local server. No need to deploy to AWS.',
          content: {
            type: 'image',
            data: {
              image: 'https://cdn.goldstack.party/img/202208/ssr-local.gif',
            },
          },
        },
      },
      {
        title: 'React Components',
        id: 'react-on-client-and-server',
        description:
          'Leverage the power of JSX for server-side rendering and for dynamic front-end pages',
        image: 'react',
        details: {
          title: 'React Components for Client and Server',
          description:
            'Define pages in JSX for server-side rendering. Pages hydrated automatically once loaded on the client.',
          content: {
            type: 'image',
            data: {
              image:
                'https://cdn.goldstack.party/img/202208/react-rendering.png',
            },
          },
        },
      },
      {
        title: 'CSS',
        id: 'css-modules',
        description:
          'Define styling for your React components using CSS Modules',
        image: 'https://cdn.goldstack.party/img/202208/css-icon.svg',
        details: {
          title: 'CSS Modules for Styling',
          description:
            'Configure custom styling using vanilla CSS. CSS automatically packaged for client-side use.',
          content: {
            type: 'image',
            data: {
              image: 'https://cdn.goldstack.party/img/202208/css-modules.png',
            },
          },
        },
      },
      {
        title: 'TypeScript',
        id: 'typescript',
        description:
          'Develop all pages and routes for your API using TypeScript.',
        image: 'typescript',
        details: {
          title: 'Full TypeScript Support',
          description:
            'Benefit from static type checking and code completion when developing your pages and routes.',
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
        title: 'Jest',
        id: 'jest',
        description:
          'Write tests for React components and rendered pages using Jest.',
        image: 'jest',
        details: {
          title: 'Unit and Integration Testing',
          description:
            'Test React components using jsdom test environment and test page rendering and API via an embedded server.',
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
          'Application deployed to reliable and scaleable AWS serverless infrastructure.',
        image: 'aws',
        details: {
          title: 'Ready for Deployment to AWS',
          description:
            'Deploy your application to AWS for professional level security, reliability and scaleability.',
          content: {
            type: 'aws-deployment',
            data: {},
          },
          moreDetails: {
            description:
              'Supports multiple, separate deployments for development, staging and production environments. Implemented using CloudFront, HTTP API Gateway and Lambda.',
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
