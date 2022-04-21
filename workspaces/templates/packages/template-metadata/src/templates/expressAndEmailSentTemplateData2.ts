import { ProjectTemplateProps } from '../projectTemplateTypes';
import { Express, EmailSend } from './moduleData';
import { getExpressTemplateData } from './expressTemplateData';
import { getEmailSendFeature } from './emailSentTemplateData';

export const getExpressAndEmailSentTemplateData = (): ProjectTemplateProps => {
  return {
    id: 'express-ses',
    title: 'Express.js + Email Send',
    images: ['ses', 'lambda', 'typescript'],
    packages: [EmailSend, Express],
    isComposite: true,
    description: 'Setup a serverless Express server with email sending.',
    longDescription:
      'This project helps you set up an Express.js server on AWS Lambda.' +
      'Also sets up all infrastructure required for sending emails through AWS SES.',
    tags: ['Express.js', 'AWS', 'SES', 'TypeScript', 'Yarn', 'Backend'],
    hero: {
      title: 'Serverless Express.js with Email Send',
      content: `
        <p>
          The Express.js with AWS SES email send enables building a fully functional, low cost backend very quickly.
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
      ...getExpressTemplateData().featuresOverview,
    ],
  };
};
