import type { ProjectTemplateProps } from '../projectTemplateTypes';
import { NextJsTailwind } from './moduleData';
import {
  featureAws,
  featureESLint,
  featureJest,
  featureNextJsComposition,
  featureTerraform,
  featureVSCode,
  featureYarn,
} from './nextjsTemplateData';

export const getNextjsTailwindTemplateData = (): ProjectTemplateProps => {
  return {
    id: 'nextjs-tailwind',
    title: 'Next.js + Tailwind',
    // boilerplateLink: 'https://github.com/goldstack/nextjs-tailwind-boilerplate',
    images: ['nextjs-tailwind', 'typescript'],
    packages: [NextJsTailwind],
    isComposite: false,
    description:
      'Ready-to-use, open source template for a Next.js project with Tailwind CSS styling.',
    metaTitle: 'Free Next.js + Tailwind Template by Goldstack',
    metaDescription:
      'Open source template and boilerplate for a Next.js project with Tailwind CSS styling. Configure the template for your project and download it for free.',
    longDescription:
      'Configures a Next.js application with Tailwind CSS.\n' +
      'Scroll down for an overview of the features included in this template.',
    actionLink: '/build?stack=tailwind',
    tags: ['Next.js', 'Tailwind', 'React', 'TypeScript', 'Yarn', 'Frontend'],
    featuresOverview: [
      {
        title: 'Next.js 15',
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
              projectName: 'app-nextjs-tailwind',
            },
          },
        },
      },
      {
        title: 'Tailwind CSS',
        id: 'tailwind',
        image: 'tailwind',
        description:
          'Next.js application configured for using the Tailwind CSS utility-first framework.',
        details: {
          title: 'Utility-First Styling with Tailwind CSS',
          description:
            'Style your components in the Next.js application with Tailwind CSS and give your application a modern, responsive look and feel.',
          content: {
            type: 'tailwind',
            data: {},
          },
          moreDetails: {
            description:
              'This also works with Tailwind CSS plugins and custom configurations. Just modify the tailwind.config.js file included in this template.',
          },
        },
      },
      {
        title: 'TypeScript',
        id: 'typescript',
        description:
          'Develop all Tailwind-styled components and pages for your Next.js application with TypeScript.',
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
