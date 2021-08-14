import { ProjectTemplateProps } from '../projectTemplateTypes';

import {
  getNextJsTemplateData,
  featureESLint,
  featureJest,
  featureVSCode,
  featureYarn,
  featureAws,
  featureTerraform,
  featureNextJsComposition,
} from './nextjsTemplateData';

export const getNextjsBootstrapTemplateData = (): ProjectTemplateProps => {
  return {
    id: 'nextjs-bootstrap',
    title: 'Next.js + Bootstrap',
    images: ['nextjs', 'bootstrap', 'typescript'],
    description: 'Deploy a Next.js project with Bootstrap styling.',
    longDescription:
      'This free starter project configures a Next.js application with Bootstrap along with a number of other features built into the template.\n' +
      'Scroll down for an overview of the features included in this template.',
    tags: ['Next.js', 'Bootstrap', 'React', 'TypeScript', 'Yarn', 'Frontend'],
    hero: {
      title: 'Next.js and Bootstrap Template',
      content: `
          <p>
            Our Next.js + Bootstrap golden template allows building optimized React applications
            with the Bootstrap CSS framework.
         </p>
          <p>
            Scroll down to learn more about what&apos;s included in this
            template.
          </p>
        `,
      action: {
        title: '✔ Start Building Your Project Now',
        link: '/build?stack=bootstrap',
      },
    },
    featuresOverview: [
      {
        title: 'Next.js 11',
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
    features: [
      {
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
      ...getNextJsTemplateData().features,
    ],
  };
};
