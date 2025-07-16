import type { ProjectTemplateProps } from '../projectTemplateTypes';
import { Express, EmailSend } from './moduleData';
import { getExpressTemplateData } from './expressTemplateData';
import { getEmailSendFeature } from './emailSendTemplateData';

export const getExpressAndEmailSentTemplateData = (): ProjectTemplateProps => {
  return {
    id: 'express-ses',
    title: 'Express.js + Email Send',
    images: ['ses', 'lambda', 'typescript'],
    packages: [EmailSend, Express],
    isComposite: true,
    metaTitle: 'Sending Outbound Email with AWS SES in Express.js',
    metaDescription:
      'Open source template for sending outbound emails from an Express.js server. All infrastructure defined in Terraform. Easy to configure and free to download.',
    description: 'Setup a serverless Express server with email sending.',
    longDescription:
      'This project helps you set up an Express.js server on AWS Lambda. ' +
      'Also sets up all infrastructure required for sending emails through AWS SES.',
    actionLink: '/build?stack=express,email-send',
    tags: ['Express.js', 'AWS', 'SES', 'TypeScript', 'Yarn', 'Backend'],
    featuresOverview: [
      getEmailSendFeature(),
      ...getExpressTemplateData().featuresOverview,
    ],
  };
};
