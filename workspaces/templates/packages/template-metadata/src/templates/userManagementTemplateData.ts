import { ProjectTemplateProps } from '../projectTemplateTypes';
import { UserManagement } from './moduleData';
import { featureYarn } from './nextjsTemplateData';

export const getUserManagementTemplate = (): ProjectTemplateProps => {
  return {
    id: 'user-management',
    title: 'User Management',
    images: ['https://cdn.goldstack.party/img/202212/cognito.svg'],
    // boilerplateLink: 'https://github.com/goldstack/react-ssr',
    packages: [UserManagement],
    isComposite: false,
    metaTitle: 'Template for User Management using Amazon Cognito',
    metaDescription:
      'Add sign up and sign in capabilities to your web application in minutes. Also provides libraries to protect your backend APIs.',
    description:
      'Provide sign up and sign up capabilities to your application using Amazon Cognito.',
    longDescription:
      'This module configures Amazon Cognito to provide sign up and sign in capabilities for your applications. Includes hosted UI for users to perform sign up and sign in operations.',
    actionLink: '/build?stack=user-management',
    tags: ['Amazon Cognito', 'Backend', 'Serverless'],
    featuresOverview: [
      {
        title: 'Sign Up Users',
        id: 'user-sign-up',
        description:
          'Easily sign up new users using the hosted UI provided by Cognito.',
        image:
          'https://cdn.goldstack.party/img/202212/front-icon-white-48-identity.svg',
        details: {
          title: 'Sign Up Users',
          description:
            'Allow users to create new accounts by providing their email address and passwords. Email addresses are verified as well.',
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
        title: 'User Sign In',
        id: 'user-sign-in',
        description: 'Allow users to sign in to your application.',
        image:
          'https://cdn.goldstack.party/img/202212/front-icon-white-47-shield.svg',
        details: {
          title: 'User Sign In',
          description:
            'Easily redirect users to a sign in page and have them return to your site with valid security tokens.',
          content: {
            type: 'image',
            data: {
              image: 'https://cdn.goldstack.party/img/202208/ssr-local.gif',
            },
          },
        },
      },
      {
        title: 'TypeScript API for React',
        id: 'react-api',
        description:
          'Call a simple method to initiate user sign up and sign in.',
        image: 'react',
        details: {
          title: 'TypeScript API for React',
          description:
            'Call the method <code>performClientAuth()</code> to initiate the auth flow when required, or return cached user credentials.',
          content: {
            type: 'image',
            data: {
              image:
                'https://cdn.goldstack.party/img/202208/react-rendering.png',
            },
          },
          moreDetails: {
            description: 'Also provides a simple method for user log out.',
          },
        },
      },
      {
        title: 'TypeScript API for Node',
        id: 'typescript-api-for-node',
        description: 'Protect your APIs by using the provided TypeScript API',
        image: 'nodejs',
        details: {
          title: 'TypeScript API for Node',
          description:
            'Use the API provided by the module to validate credentials and obtain user details.',
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
        title: 'Unit Testing with Jest',
        id: 'jest',
        description: 'Test your frontend and backend code using Jest.',
        image: 'jest',
        details: {
          title: 'Unit Testing with Jest',
          description:
            'Test your existing frontend and backend code easily with the automatically provided mock implementation for the APIs.',
          icons: ['jest'],
          content: {
            type: 'none',
            data: {},
          },
        },
      },
      featureYarn,
      {
        title: 'Production-grade AWS Infrastructure',
        id: 'aws',
        description:
          'Application deployed to reliable and scaleable AWS serverless infrastructure.',
        image: 'aws',
        details: {
          title: 'Production-grade AWS Infrastructure',
          description:
            'Deploy your application to AWS for professional level security, reliability and scaleability.',
          content: {
            type: 'aws-deployment',
            data: {},
          },
          moreDetails: {
            description:
              'Supports multiple, separate deployments for development, staging and production environments. Implemented using Amazon Cognito.',
          },
        },
      },
      {
        title: 'Extend Infrastructure with Terraform',
        id: 'terraform',
        description: 'Extend and maintain the user management using Terraform.',
        image: 'terraform',
        details: {
          title: 'Extend Infrastructure with Terraform',
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
          title: 'App Composition',
          description:
            'Combine this template with other modules from Goldstack. Generate a starter project supporting your full stack including the frontend.',
          content: {
            type: 'combine-templates',
            data: {
              templates: [
                'template:server-side-rendering',
                'template:serverless-api',
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
