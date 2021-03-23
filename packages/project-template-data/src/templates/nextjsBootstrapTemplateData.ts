import { ProjectTemplateProps } from '../projectTemplateTypes';

import { getNextJsTemplateData } from './nextjsTemplateData';

export const getNextjsBootstrapTemplateData = (): ProjectTemplateProps => {
  return {
    title: 'Next.js + Bootstrap Template',
    description:
      'Download an optimised starter template to start your project with Next.js and Bootstrap.',
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
