import { ProjectTemplateProps } from '../projectTemplateTypes';
import { Express, EmailSend } from './moduleData';
import { getExpressTemplateData } from './expressTemplateData';

export const getEmailSentTemplateData = (): ProjectTemplateProps => {
  return {
    id: 'express-ses',
    title: 'Express.js + Email Send',
    images: ['ses', 'lambda', 'typescript'],
    packages: [EmailSend, Express],
    isComposite: true,
    description: 'Setup a servless Express server with email sending.',
    longDescription:
      'This project helps you set up an Express.js server on AWS Lambda.' +
      'Also sets up all infrastructure required for sending emails through AWS SES.',
    tags: ['Express.js', 'AWS', 'SED', 'TypeScript', 'Yarn', 'Backend'],
    hero: {
      title: 'Servless Express.js with Email Send',
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
      {
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
      },
      ...getExpressTemplateData().featuresOverview,
    ],
    features: [...getExpressTemplateData().features],
  };
};
