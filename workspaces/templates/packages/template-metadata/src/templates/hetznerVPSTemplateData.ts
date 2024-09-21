import { ProjectTemplateProps } from '../projectTemplateTypes';
import { GoGin } from './moduleData';

export const getHetznerVPSTemplateData = (): ProjectTemplateProps => {
  return {
    id: 'hetzner-vps',
    title: 'Hetzner VPS',
    images: ['https://cdn.goldstack.party/img/202409/hetzner.svg'],
    packages: [GoGin],
    isComposite: false,
    description:
      'Define a Hetzner VPS using infrastructure as code and Docker.',
    metaTitle: 'Hardened Hetzner VPS Template with IaaC and Deployment Scripts',
    metaDescription:
      'Define a Hetzner VPS in code and get it up and running in minutes.',
    longDescription:
      'This template contains a Terraform configuration for a Hetzner server along with scripts to deploy an application.\n' +
      'See a list of all features included in this template below.',
    actionLink: '/build?stack=hetzner-vps',
    tags: ['Hetzner', 'Terraform', 'VPS'],
    featuresOverview: [
      {
        title: 'Gin Framework',
        id: 'gin',
        description:
          'Develop all routes of your API using the powerful Gin framework.',
        image: 'https://cdn.goldstack.party/img/202104/go_gin.png',
        details: {
          title: 'Develop HTTP Routes',
          description:
            'The Gin framework allows building high performance HTTP APIs using Go.',
          content: {
            type: 'image',
            data: {
              image: 'https://cdn.goldstack.party/img/202104/gin_server.png',
            },
          },
        },
      },
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
        title: 'AWS',
        id: 'aws',
        description:
          'Go server deployed to reliable and scaleable AWS serverless infrastructure.',
        image: 'aws',
        details: {
          title: 'Ready for Deployment to AWS',
          description:
            'Deploy your Go Gin application for cents on AWS with professional level security, reliability and scaleability.',
          content: {
            type: 'aws-deployment',
            data: {},
          },
          moreDetails: {
            description:
              'Supports multiple, separate deployments for development, staging and production environments. Implemented using CloudFront and S3.',
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
            'In addition to Go project definitions, a workspace managed by Yarn is included in the project. ' +
            'This allows for cross-platform script definition and manage a frontend application in the same workspace.',
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
            'Easily add additional resources from the AWS cloud to your Go server by modifying the Terraform files included in the template.',
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
