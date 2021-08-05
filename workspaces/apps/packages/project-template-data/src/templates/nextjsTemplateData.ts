import {
  ProjectTemplateProps,
  ShortTemplateFeature,
} from '../projectTemplateTypes';

export const featureESLint: ShortTemplateFeature = {
  title: 'ESLint + Prettier',
  id: 'eslint',
  description:
    'Auto-format and validate your TypeScript and React code easily using ESLint and Prettier.',
  image: 'eslint',
  details: {
    title: 'Linting and Formatting',
    description:
      'ESLint and Prettier configured for usage in the CLI and as VSCode plugins. Optimized to work with Next.js, TypeScript and JSX.',
    icons: ['eslint'],
    content: {
      type: 'none',
      data: {},
    },
  },
};

export const featureJest: ShortTemplateFeature = {
  title: 'Jest',
  id: 'jest',
  description:
    'Run tests for components and the Next.js application using Jest.',
  image: 'jest',
  details: {
    title: 'Unit and Integration Testing',
    description:
      'Write unit and integration tests for your Next.js application with zero additional setup required.',
    icons: ['jest'],
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
    'Template configured to work seemlessly with the powerful VSCode editor.',
  image: 'vscode',
  details: {
    title: 'Develop in VSCode',
    description:
      'All configuration for developing TypeScript and TSX code for VSCode provided.',
    icons: ['vscode'],
    content: {
      type: 'none',
      data: {},
    },
  },
};

export const featureYarn: ShortTemplateFeature = {
  title: 'Yarn 2',
  id: 'yarn',
  description:
    'Fast build times and advanced modularity using Yarn 2 workspaces.',
  image: 'yarn',
  details: {
    title: 'Build Modular Applications with Yarn Workspaces',
    description:
      'Yarn 2 workspace configured for blazing fast project bootstrap and hassle-free development of a modular application.',
    icons: ['yarn'],
    content: {
      type: 'none',
      data: {},
    },
  },
};

export const featureAws: ShortTemplateFeature = {
  title: 'AWS',
  id: 'aws',
  description:
    'Next.js app deployed to reliable and scaleable AWS serverless infrastructure.',
  image: 'aws',
  details: {
    title: 'Ready for Deployment to AWS',
    description:
      'Deploy your Next.js application for cents on AWS with professional level security, reliabilty and scaleabilty.',
    content: {
      type: 'aws-deployment',
      data: {},
    },
    moreDetails: {
      description:
        'Supports multiple, separate deployments for development, staging and production environments. Implemented using CloudFront and S3.',
    },
  },
};

export const featureTerraform: ShortTemplateFeature = {
  title: 'Terraform',
  id: 'terraform',
  description: 'Extend and maintain frontend infrastructure using Terraform.',
  image: 'terraform',
  details: {
    title: 'Extendable and Configurable Infrastructure',
    description:
      'Easily add any service from the AWS cloud to your Next.js application by modifying the Terraform files included in the template.',
    icons: ['terraform'],
    content: {
      type: 'none',
      data: {},
    },
  },
};

export const featureNextJsComposition: ShortTemplateFeature = {
  title: 'App Composition',
  id: 'composition',
  description:
    'Easily combine with any Goldstack module to compose end-to-end applications.',
  image: 'composition',
  details: {
    title: 'Integrate with Goldstack Templates',
    description:
      'Combine this template with other modules from Goldstack. Generate a starter project supporting your full stack including the backend.',
    content: {
      type: 'combine-templates',
      data: {
        templates: [
          'template:lambda-express',
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
};

export const getNextJsTemplateData = (): ProjectTemplateProps => {
  return {
    id: 'nextjs',
    title: 'Next.js Template',
    images: ['nextjs', 'react', 'typescript'],
    description:
      'Next.js with all the fun and none of the hassle. Download an optimised starter template.',
    longDescription:
      'The free Goldstack <strong>Next.js starter template</strong> helps you kick start your Next.js development project. ' +
      'It has been hand-crafted for optimal developer experience and packed with best practices.\n' +
      'Scroll down to learn more about the features included in this template.',
    tags: ['Next.js', 'TypeScript', 'Yarn', 'React', 'Frontend'],
    hero: {
      title: 'Next.js with all the fun and none of the hassle.',
      content: `
        
          <p>
            Start working on what matters to you rather than being stuck with
            project setup. Our Next.js golden template comes packaged with
            features tailor-made to bring coding joy.
          </p>
          <p>
            Scroll down to learn more about what&apos;s included in this
            template.
          </p>
        `,
      action: {
        title: '✔ Start Building Your Project Now',
        link: '/build?stack=nextjs',
      },
    },
    featuresOverview: [
      {
        title: 'Next.js 11',
        id: 'nextjs',
        description: 'Start developing with the Next.js framework in minutes.',
        image: 'nextjs',
        details: {
          title: 'Next.js Project Ready in Minutes',
          description:
            'Begin your work with a carefully crafted project where all dependencies you need are provided in compatible versions.',
          content: {
            type: 'project-install',
            data: {
              projectName: 'app-nextjs',
            },
          },
        },
      },
      {
        title: 'TypeScript',
        id: 'typescript',
        description:
          'Develop all components and pages for your Next.js application with TypeScript.',
        image: 'typescript',
        details: {
          title: 'Full TypeScript Support',
          description:
            'Benefit from static type checking and code completion when developing your components and pages with Next.js',
          content: {
            type: 'gif',
            data: {
              gif: 'react-typescript',
            },
          },
        },
      },
      featureESLint,
      featureJest,
      featureVSCode,
      featureYarn,
      featureAws,
      featureTerraform,
      featureNextJsComposition,
    ],
    features: [
      {
        title: 'Project Ready in Minutes',
        description:
          'Begin your work with a carefully crafted project where all dependencies you need are provided in compatible versions.',
        content: {
          type: 'project-install',
          data: {
            projectName: 'app-nextjs',
          },
        },
      },
      {
        title: 'Full TypeScript Support',
        description:
          'Develop all components and pages for your Next.js application with TypeScript. Everything set up to work in VSCode.',
        content: {
          type: 'gif',
          data: {
            gif: 'react-typescript',
          },
        },
      },
      {
        title: 'Linting and Formatting',
        description:
          'ESLint and Prettier configured for usage in the CLI and as VSCode plugins. Optimized to work with Next.js, TypeScript and JSX.',
        icons: ['eslint'],
        content: {
          type: 'none',
          data: {},
        },
      },
      {
        title: 'Configure Project in Goldstack UI',
        description:
          'Use our web-based tool to configure your project and Next.js package. This will establish basics such as which domain your application should be deployed to.',
        content: {
          type: 'gif',
          data: {
            gif: 'nextjs-config',
          },
        },
        moreDetails: {
          description:
            'The configuration tool will assemble a project you can download as a ZIP file. All settings will be stored in easily extendable and modifiable JSON files.',
        },
      },
      {
        title: 'Ready for Deployment to AWS',
        description:
          'Deploy your Next.js application for cents on AWS with professional level security, reliabilty and scaleabilty.',
        content: {
          type: 'aws-deployment',
          data: {},
        },
        moreDetails: {
          description:
            'Supports multiple, separate deployments for development, staging and production environments. Implemented using CloudFront and S3.',
        },
        // icons: [AWSIcon, CloudFrontIcon, S3Icon],
      },
      {
        title: 'Easy to Deploy to Vercel',
        description:
          'If you prefer to deploy your Next.js application to Vercel over AWS, this can be accomplished in a few easy steps if you have a Vercel account.',
        content: {
          type: 'image',
          data: {
            image: 'vercel-deployed',
          },
        },
        moreDetails: {
          description: '',
        },
      },
      {
        title: 'Extendable and Configurable Infrastructure',
        description:
          'Easily add any service from the AWS cloud to your Next.js application by modifying the Terraform files included in the template.',
        icons: ['terraform'],
        content: {
          type: 'none',
          data: {},
        },
      },
      {
        title: 'Integrate with Goldstack Templates',
        description:
          'Combine this template with other golden templates from Goldstack. Generate a starter project supporting your full stack including the backend.',
        content: {
          type: 'combine-templates',
          data: {
            templates: [
              'template:lambda-express',
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
    ],
  };
};
