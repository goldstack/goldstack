import { ProjectTemplateProps } from '../projectTemplateTypes';
import { LambdaPythonJob } from './moduleData';

export const getLambdaPythonJobTemplateData = (): ProjectTemplateProps => {
  return {
    id: 'lambda-python-job',
    title: 'AWS Lambda Python Job',
    images: ['https://cdn.goldstack.party/img/202409/python.svg', 'lambda'],
    packages: [LambdaPythonJob],
    isComposite: false,
    description: 'Deploy a Python scheduled Job using AWS Lambda',
    metaTitle: 'Serverless Python Job Template for AWS Lambda',
    metaDescription:
      'Deploy a scheduled Python Job to AWS Lambda. Infrastructure defined in Terraform and deployment scripts provided.',
    longDescription:
      'This project template contains a Python Job deployed to AWS Lambda.\n' +
      'See a list of all features included in this template below.',
    actionLink: '/build?stack=lambda-python-job',
    tags: ['Python', 'Schedule', 'Backend', 'Lambda', 'Serverless'],
    featuresOverview: [
      {
        title: 'Serverless Python Job',
        id: 'serverless-python-job',
        description: 'Write Python code that will be run on a schedule on AWS',
        image: 'https://cdn.goldstack.party/img/202409/python.svg',
        details: {
          title: 'Develop Python Logic',
          description:
            'Write Python code including dependencies that will be packaged up for deployment to AWS.',
          content: {
            type: 'image',
            data: {
              image:
                'https://cdn.goldstack.party/img/202409/python_lambda_code.png',
            },
          },
        },
      },
      {
        title: 'AWS',
        id: 'aws',
        description:
          'Lambda deployed to reliable and scaleable AWS serverless infrastructure.',
        image: 'aws',
        details: {
          title: 'Ready for Deployment to AWS',
          description:
            'Deploy your Python job for cents on AWS with professional level security, reliability and scaleability.',
          content: {
            type: 'aws-deployment',
            data: {},
          },
          moreDetails: {
            description:
              'Supports multiple, separate deployments for development, staging and production environments. Implemented using Lambda and EventBridge triggers.',
          },
        },
      },
      {
        title: 'Yarn 3',
        id: 'yarn',
        description:
          'Build scripts managed using Yarn for easy integration with frontend projects.',
        image: 'yarn',
        details: {
          title: 'Cross-platform Workspace Management',
          description:
            'This template includes a workspace for a Node.js project managed by Yarn. ' +
            'This allows for cross-platform script definition and manage other components in the same workspace.',
          icons: ['yarn'],
          content: {
            type: 'none',
            data: {},
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
            'Easily add additional resources from the AWS cloud to your application by modifying the Terraform files included in the template.',
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
