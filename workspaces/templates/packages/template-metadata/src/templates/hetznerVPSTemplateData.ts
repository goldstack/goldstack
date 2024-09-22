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
        title: 'Hetzner VPS set up and deployment',
        id: 'gin',
        description:
          'Define your Hetzner server as Infrastructure as Code and easily deploy from local files or from within your CLI.',
        image: 'https://cdn.goldstack.party/img/202409/hetzner.svg',
        details: {
          title: 'Develop HTTP Routes',
          description:
            'The Gin framework allows building high performance HTTP APIs using Go.',
          content: {
            type: 'image',
            data: {
              image:
                'https://cdn.goldstack.party/img/202409/hetzner_vps_deploy.png',
            },
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
