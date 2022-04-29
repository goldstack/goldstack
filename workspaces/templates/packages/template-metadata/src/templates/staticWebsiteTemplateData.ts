import {
  ProjectTemplateProps,
  ShortTemplateFeature,
} from '../projectTemplateTypes';
import { StaticWebsite } from './moduleData';
import { featureYarn } from './nextjsTemplateData';

export const featureESLint: ShortTemplateFeature = {
  title: 'ESLint + Prettier',
  id: 'eslint',
  description:
    'Auto-format and validate your HTML and CSS code easily using ESLint and Prettier.',
  image: 'eslint',
  details: {
    title: 'Linting and Formatting',
    description:
      'ESLint and Prettier configured for usage in the CLI and as VSCode plugins. Optimized to work with HTML and CSS.',
    icons: ['eslint'],
    content: {
      type: 'none',
      data: {},
    },
  },
};

export const featureVSCode: ShortTemplateFeature = {
  title: 'VSCode',
  id: 'vscode',
  description:
    'Template configured to work seamlessly with the powerful VSCode editor.',
  image: 'vscode',
  details: {
    title: 'Develop in VSCode',
    description:
      'All configuration for developing HTML and CSS code in VSCode provided.',
    icons: ['vscode'],
    content: {
      type: 'none',
      data: {},
    },
  },
};

export const featureStaticWebsiteComposition: ShortTemplateFeature = {
  title: 'App Composition',
  id: 'composition',
  description:
    'Easily combine with other Goldstack templates to compose fullstack applications.',
  image: 'composition',
  details: {
    title: 'Compose a Fullstack Application',
    description:
      'Combine this template with other templates such as Node.js backend.',
    content: {
      type: 'combine-templates',
      data: {
        templates: ['template:lambda-express', 'template:serverless-api'],
      },
    },
    moreDetails: {
      description:
        'Add a dynamic backend API or other templates to your project in a few simple steps.',
    },
  },
};

export const getStaticWebsiteTemplateData = (): ProjectTemplateProps => {
  return {
    id: 'static-website',
    title: 'Static Website',
    packages: [StaticWebsite],
    boilerplateLink: 'https://github.com/goldstack/static-website-boilerplate',
    isComposite: false,
    images: [
      'https://cdn.goldstack.party/img/202204/cloudfront.svg',
      'typescript',
    ],
    description: 'Host a static website on AWS.',
    longDescription:
      'Upload HTML and CSS files to S3 and configure CloudFront to serve them.',
    tags: ['AWS', 'CloudFront', 'TypeScript', 'Yarn', 'React', 'Frontend'],
    hero: {
      title: 'Get a website up and running in minutes',
      content: `
          <p>
            Start working on what matters to you rather than being stuck with
            project setup. Our Static Website golden template comes packaged with
            features tailor-made to bring coding joy.
          </p>
          <p>
            Scroll down to learn more about what&apos;s included in this
            template.
          </p>
        `,
      action: {
        title: '✔ Start Building Your Project Now',
        link: '/build?stack=static-website',
      },
    },
    featuresOverview: [
      {
        title: 'CloudFront CDN',
        id: 'static-website-hosting-cloudfront',
        description: 'Serve your files through the CloudFront CDN.',
        image: 'https://cdn.goldstack.party/img/202204/cloudfront.svg',
        details: {
          title: 'Fast Load Times using CloudFront CDN',
          description:
            'Have your website load fast anywhere in the world by using the CloudFront CDN. ',
          content: {
            type: 'gif',
            data: {
              gif:
                'https://cdn.goldstack.party/img/202204/cloudfront_website_load.gif',
            },
          },
        },
      },
      {
        title: 'SSL',
        id: 'ssl',
        description: 'Provide your website to users using a secure https link',
        image: 'https://cdn.goldstack.party/img/202204/ssl.svg',
        details: {
          title: 'Secure Traffic to your Website with TLS.',
          description:
            'Use a free SSL/TSL certificate provided by AWS to secure all traffic to your website.',
          content: {
            type: 'image',
            data: {
              image:
                'https://cdn.goldstack.party/img/202204/ssl_certificate.png',
            },
          },
        },
      },
      {
        title: 'Local Development',
        id: 'local-development',
        description: 'Use a local development server with hot reload',
        image: 'https://cdn.goldstack.party/img/202204/local-development.svg',
        details: {
          title: 'Develop your Website Locally',
          description:
            'Use the included local development server to develop and test your changes locally.',
          content: {
            type: 'gif',
            data: {
              gif:
                'https://cdn.goldstack.party/img/202204/local-development.gif',
            },
          },
        },
      },
      {
        title: 'S3',
        id: 'static-website-hosting-s3',
        description: 'Upload and store files in AWS S3.',
        image: 'https://cdn.goldstack.party/img/202204/s3.svg',
        details: {
          title: 'Cheap Storage on S3.',
          icons: ['https://cdn.goldstack.party/img/202204/s3.svg'],
          description:
            'Store files small and large for your website easily in AWS S3.',
          content: {
            type: 'none',
            data: {},
          },
        },
      },
      {
        title: 'Terraform',
        id: 'terraform',
        description: 'Set up and extend infrastructure with Terraform.',
        image: 'terraform',
        details: {
          title: 'Define Infrastructure using Terraform',
          description:
            'Use the Terraform files included in the template to stand up your website on AWS quickly - and extend it easily if required.',
          icons: ['terraform'],
          content: {
            type: 'none',
            data: {},
          },
        },
      },
      {
        title: 'Automated Deployment',
        id: 'static-website-hosting-deployment',
        description: 'Deploy your changes to AWS automatically.',
        image: 'https://cdn.goldstack.party/img/202204/deploy.svg',
        details: {
          title: 'Automatically Deploy Changes',
          description:
            'Use scripts provided as part of the template to deploy changes to your website to AWS.',
          content: {
            type: 'gif',
            data: {
              gif: 'https://cdn.goldstack.party/img/202204/yarn-deploy.gif',
            },
          },
        },
      },
      featureESLint,
      featureVSCode,
      featureYarn,
      featureStaticWebsiteComposition,
    ],
  };
};
