import { ProjectTemplateProps } from '../projectTemplateTypes';
import { EmailSend } from './moduleData';
import { getExpressTemplateData } from './expressTemplateData';
import { ShortTemplateFeature } from 'src/projectTemplateData';

export const getEmailSendFeature = (): ShortTemplateFeature => {
  return {
    title: 'Sending Emails with AWS SES',
    id: 'ses',
    description:
      'Send emails through AWS highly reliable, low cost infrastructure.',
    image: 'ses',
    details: {
      title: 'Infrastructure and Configuration Ready for AWS SES',
      description:
        'Quickly get started with sending emails from your application.',
      content: {
        type: 'image',
        data: {
          image: 'email-send',
        },
      },
    },
  };
};

export const getEmailSentTemplateData = (): ProjectTemplateProps => {
  return {
    id: 'ses',
    title: 'Email Send (SES)',
    images: ['ses', 'typescript'],
    packages: [EmailSend],
    isComposite: false,
    description: 'Setup email sending .',
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
      getEmailSendFeature(),
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
    ],
  };
};
