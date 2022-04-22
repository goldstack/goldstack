import { ProjectTemplateProps } from '../projectTemplateTypes';
import { EmailSend } from './moduleData';
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
        'Quickly get started with sending emails from your application.',
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
    id: 'ses',
    title: 'Email Send (SES)',
    boilerplateLink:
      'https://github.com/goldstack/ses-terraform-typescript-boilerplate',
    images: ['ses', 'typescript'],
    packages: [EmailSend],
    isComposite: false,
    description: 'Send emails from your application using AWS SES.',
    longDescription:
      'This project provides a complete setup for sending emails with AWS Simple Email Service (SES).',
    tags: ['AWS', 'SES', 'TypeScript', 'Yarn', 'Backend'],
    hero: {
      title: 'Sending Email with AWS SES',
      content: `
        <p>
          The Email Send (SES) template enables building an application that sends email through the AWS Simple Email Service (SES).
        </p>
          <p>
            Scroll down to learn more about what&apos;s included in this
            template.
          </p>
        `,
      action: {
        title: '✔ Start Building Your Project Now',
        link: '/build?stack=express,email-send',
      },
    },
    featuresOverview: [
      getS3Feature(),
      {
        title: 'TypeScript',
        id: 'typescript',
        description:
          'Develop the code for composing and sending your email using TypeScript.',
        image: 'typescript',
        details: {
          title: 'TypeScript configured in template',
          description:
            'Benefit from static type checking and code completion when developing your SES integration',
          content: {
            type: 'image',
            data: {
              image:
                'https://cdn.goldstack.party/img/202204/ses_typescript.png',
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
      featureAppComposition(['template:app-nextjs-bootstrap']),
    ],
  };
};
