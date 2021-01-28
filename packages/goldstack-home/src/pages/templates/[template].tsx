import React from 'react';

import { GetStaticProps, GetStaticPaths } from 'next';

import Header from 'src/components/Header';

import TemplateComponent, {
  TemplateProps,
} from 'src/components/template/Template';

import TerraformIcon from 'src/icons/terraform.svg';

import ESLintIcon from 'src/icons/eslint.svg';
import Footer from 'src/components/Footer';

const Template = (props: TemplateProps): JSX.Element => {
  const template = props;
  return (
    <>
      <Header></Header>
      {template && <TemplateComponent {...template}></TemplateComponent>}
      <Footer></Footer>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      {
        params: { template: 'nextjs' },
      },
      {
        params: { template: 'nextjs-bootstrap' },
      },
    ],
    fallback: false, // Show 404 for pages that are not prerendered
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const nextJsTemplate: TemplateProps = {
    title: 'Next.js Template',
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
    features: [
      {
        title: 'Project Ready in Minutes',
        description:
          'Begin your work with a carefully crafted project where all dependencies you need are provided in compatible versions.',
        content: {
          type: 'project-install',
          data: {},
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
        icons: [ESLintIcon],
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
        icons: [TerraformIcon],
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

  const nextJsBootstrapTemplate: TemplateProps = {
    title: 'Next.js + Bootstrap Template',
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
      ...nextJsTemplate.features,
    ],
  };

  if (!context.params) {
    throw new Error('Cannot render template without path.');
  }

  const templateId = context.params.template;

  let template: TemplateProps | undefined;
  if (templateId === 'nextjs') {
    template = nextJsTemplate;
  }
  if (templateId == 'nextjs-bootstrap') {
    template = nextJsBootstrapTemplate;
  }

  return {
    props: {
      ...template,
    },
  };
};

export default Template;
