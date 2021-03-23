import { ProjectTemplateProps } from '../projectTemplateTypes';

export const getExpressTemplateData = (): ProjectTemplateProps => {
  return {
    title: 'Express.js Lambda Template',
    description:
      'Rapidly deploy an Express.js server to AWS Lambda. All infrastructure defined in Terraform.',
    hero: {
      title: 'Express.js Lambda Template',
      content: `
          <p>
            Rapidly deploy an Express.js server to AWS Lambda. All infrastructure already defined. Optimised for high-performance deployment using Webpack.
          </p>
          <p>
            Scroll down to learn more about what&apos;s included in this
            template.
          </p>
        `,
      action: {
        title: '✔ Start Building Your Project Now',
        link: '/build?stack=express',
      },
    },
    features: [
      {
        title: 'Project Ready in Minutes',
        description:
          'Begin your work with a carefully crafted project where all dependencies you need are provided in compatible versions.',
        content: {
          type: 'project-install',
          data: {
            projectName: 'app-express-lambda',
          },
        },
      },
      {
        title: 'Full TypeScript Support',
        description: 'Develop all routes using TypeScript.',
        content: {
          type: 'image',
          data: {
            image: 'endpoint-typescript',
          },
        },
      },
      {
        title: 'Linting and Formatting',
        description:
          'ESLint and Prettier configured for usage in the CLI and as VSCode plugins. Optimized to work with Node.js.',
        icons: ['eslint'],
        content: {
          type: 'none',
          data: {},
        },
      },
      {
        title: 'Configure Project in Goldstack UI',
        description:
          'Use our web-based tool to configure your project. This will establish basics such as which domain your API will be deployed to.',
        content: {
          type: 'image',
          data: {
            image: 'lambda-config',
          },
        },
        moreDetails: {
          description:
            'The configuration tool will assemble a project you can download as a ZIP file. All settings will be stored in easily extendable and modifiable JSON files.',
        },
      },
      {
        title: 'Ready for Deployment to AWS',
        description:
          'Deploy your Express application for cents on AWS with professional level security, reliabilty and scaleabilty.',
        content: {
          type: 'aws-deployment',
          data: {},
        },
        moreDetails: {
          description:
            'Supports multiple, separate deployments for development, staging and production environments. Implemented using API Gateway and AWS Lambda.',
        },
        // icons: [AWSIcon, CloudFrontIcon, S3Icon],
      },
      {
        title: 'Extendable and Configurable Infrastructure',
        description:
          'Easily add any service from the AWS cloud to your Express application by modifying the Terraform files included in the template.',
        icons: ['terraform'],
        content: {
          type: 'none',
          data: {},
        },
      },
      {
        title: 'Integrate with Goldstack Templates',
        description:
          'Combine this template with other golden templates from Goldstack. Generate a starter project supporting your full stack including the backend.',
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
    ],
  };
};
