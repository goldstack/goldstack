import { ProjectTemplateProps } from '../projectTemplateTypes';

import {
  featureESLint,
  featureJest,
  featureVSCode,
  featureYarn,
  featureAws,
  featureTerraform,
  featureNextJsComposition,
} from './nextjsTemplateData';

import { NextJsBootstrap } from './moduleData';

export const getNextjsBootstrapTemplateData = (): ProjectTemplateProps => {
  return {
    id: 'nextjs-bootstrap',
    title: 'Next.js + Bootstrap',
    boilerplateLink:
      'https://github.com/goldstack/nextjs-bootstrap-boilerplate',
    images: ['nextjs-bootstrap', 'typescript'],
    packages: [NextJsBootstrap],
    isComposite: false,
    description:
      'Ready-to-use, open source template for a Next.js project with Bootstrap styling.',
    metaTitle: 'Free Next.js + Bootstrap Template by Goldstack',
    metaDescription:
      'Open source template and boilerplate for a Next.js project with Bootstrap styling. Configure the template for your project and download it for free.',
    longDescription:
      'Configures a Next.js application with Bootstrap.\n' +
      'Scroll down for an overview of the features included in this template.',
    actionLink: '/build?stack=bootstrap',
    tags: ['Next.js', 'Bootstrap', 'React', 'TypeScript', 'Yarn', 'Frontend'],
    featuresOverview: [
      {
        title: 'Next.js 12',
        id: 'nextjs',
        description: 'Get coding with the Next.js framework in minutes.',
        image: 'nextjs',
        details: {
          title: 'Next.js Project Ready in Minutes',
          description:
            'Begin your work with a carefully crafted Next.js project where all dependencies you need are provided in compatible versions.',
          content: {
            type: 'project-install',
            data: {
              projectName: 'app-nextjs',
            },
          },
        },
      },
      {
        title: 'Bootstrap',
        id: 'bootstrap',
        image: 'bootstrap',
        description:
          'Next.js application configured for using the Bootstrap CSS framework.',
        details: {
          title: 'Bootstrap Styling for React Components',
          description:
            'Style your components in the Next.js application with Bootstrap and give your application a professional look and feel.',
          content: {
            type: 'bootstrap',
            data: {},
          },
          moreDetails: {
            description:
              'This also works with Bootstrap templates. Just replace the Bootstrap CSS files included in this template.',
          },
        },
      },
      {
        title: 'TypeScript',
        id: 'typescript',
        description:
          'Develop all Bootstrap-styled components and pages for your Next.js application with TypeScript.',
        image: 'typescript',
        details: {
          title: 'Full TypeScript Support',
          description:
            'Benefit from static type checking and code completion when developing your components and pages with Next.js.',
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
  };
};
