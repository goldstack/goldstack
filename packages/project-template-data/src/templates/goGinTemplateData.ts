import { ProjectTemplateProps } from '../projectTemplateTypes';
import {
  featureESLint,
  featureJest,
  featureVSCode,
  featureYarn,
  featureAws,
  featureTerraform,
} from './nextjsTemplateData';

export const getExpressTemplateData = (): ProjectTemplateProps => {
  return {
    title: 'Go Gin Lambda Template',
    image: 'https://cdn.goldstack.party/img/202104/go_gin.png',
    description: 'Deploy a serverless Go HTTP server using AWS labmda.',
    longDescription:
      'This project template contains a fully configured server using the Gin framework ready to be deployed in an AWS Lambda.\n' +
      'See a list of all features included in this template below.',
    tags: ['Go', 'Gin', 'Backend', 'Lambda', 'Serverless'],
    hero: {
      title: 'Go Gin Lambda Template',
      content: `
          <p>
            Rapidly deploy an Gin server to AWS Lambda. All infrastructure already defined.
          </p>
          <p>
            Scroll down to learn more about what&apos;s included in this
            template.
          </p>
        `,
      action: {
        title: '✔ Start Building Your Project Now',
        link: '/build?stack=gin',
      },
    },
    featuresOverview: [
      {
        title: 'Go',
        id: 'go',
        description: 'Develop your serverless function using Go.',
        image: 'https://cdn.goldstack.party/img/202104/gopher.svg',
        details: {
          title: 'Go Project Ready in Minutes',
          description:
            'Begin your work with a carefully crafted project where everything is ready to start coding.',
          content: {
            type: 'project-install',
            data: {
              projectName: 'app-go-gin-lambda',
            },
          },
        },
      },
      {
        title: 'Gin Framework',
        id: 'gin',
        description:
          'Develop all routes of your API using the powerful Gin framework.',
        image: 'https://cdn.goldstack.party/img/202104/go_gin.png',
        details: {
          title: 'Develop HTTP routes using Gin',
          description:
            'The Gin framework allows building high performance HTTP APIs using Go.',
          content: {
            type: 'image',
            data: {
              image: 'endpoint-typescript',
            },
          },
        },
      },
      featureYarn,
      featureAws,
      featureTerraform,
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
    features: [],
  };
};
