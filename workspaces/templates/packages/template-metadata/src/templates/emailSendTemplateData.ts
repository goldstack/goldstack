import type { ShortTemplateFeature } from '../projectTemplateData';
import type { ProjectTemplateProps } from '../projectTemplateTypes';
import { EmailSend } from './moduleData';
import { featureAppComposition, featureVSCode, featureYarn3 } from './sharedFeatures';

export const getEmailSendFeature = (): ShortTemplateFeature => {
  return {
    title: 'Sending Emails with AWS SES',
    id: 'ses',
    description: 'Send emails through AWS highly reliable, low cost infrastructure.',
    image: 'ses',
    details: {
      title: 'Start Sending Emails from you Application in Minutes',
      description: 'Quickly get started with sending emails with SES from your application.',
      content: {
        type: 'image',
        data: {
          image: 'email-send',
        },
      },
    },
  };
};

export const getEmailSendTemplateData = (): ProjectTemplateProps => {
  return {
    id: 'ses',
    title: 'Email Send (SES)',
    metaTitle: 'AWS SES Email Send Template and Boilerplate for Terraform',
    metaDescription:
      'Open source template for sending outbound email using AWS SES from TypeScript applications. All infrastructure defined using Terraform. Download for free.',
    boilerplateLink: 'https://github.com/goldstack/ses-terraform-typescript-boilerplate',
    images: ['ses', 'terraform', 'typescript'],
    packages: [EmailSend],
    isComposite: false,
    description: 'Send emails from your application using AWS SES.',
    longDescription:
      'This project provides a complete setup for sending outbound emails with AWS Simple Email Service (SES).',
    actionLink: '/build?stack=email-send',
    tags: ['AWS', 'SES', 'TypeScript', 'Terraform', 'Yarn', 'Backend'],
    featuresOverview: [
      getEmailSendFeature(),
      {
        title: 'TypeScript',
        id: 'typescript',
        description:
          'Develop the code for composing and sending your outbound email using TypeScript.',
        image: 'typescript',
        details: {
          title: 'TypeScript configured in template',
          description:
            'Benefit from static type checking and code completion when developing your SES integration',
          content: {
            type: 'image',
            data: {
              image: 'https://cdn.goldstack.party/img/202204/ses_typescript.png',
            },
          },
        },
      },
      {
        title: 'Jest',
        id: 'jest',
        description: 'Run tests for email send logic with Jest.',
        image: 'jest',
        details: {
          title: 'Unit and Integration Testing',
          description:
            'Write unit and integration tests for your SES integration. Utilities for local mocking included.',
          icons: ['jest'],
          content: {
            type: 'image',
            data: {
              image: 'https://cdn.goldstack.party/img/202204/ses_jest.png',
            },
          },
        },
      },
      {
        title: 'AWS',
        id: 'aws',
        description:
          'Use the AWS Simple Email Server for reliably and cheaply send high volume emails.',
        image: 'aws',
        details: {
          title: 'Ready for Deployment to AWS',
          description:
            'Deploy your SES configuration for cents on AWS with professional level security, reliability and scaleability.',
          content: {
            type: 'aws-deployment',
            data: {},
          },
          moreDetails: {
            description:
              'Supports multiple, separate deployments for development, staging and production environments. Implemented using SES.',
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
            'Easily modify and extend your SES configuration by working with the Terraform files included in the template.',
          icons: ['terraform'],
          content: {
            type: 'none',
            data: {},
          },
        },
      },
      featureYarn3(),
      featureVSCode(),
      featureAppComposition(['template:serverless-api', 'template:express-lambda']),
    ],
  };
};
